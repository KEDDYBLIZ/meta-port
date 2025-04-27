;; meta-port.clar
;; Decentralized Metaverse Navigation Portal
;; A secure and transparent portal for metaverse navigation on Stacks blockchain

;; Error Codes
(define-constant ERR_UNAUTHORIZED u100)
(define-constant ERR_USER_NOT_FOUND u101)
(define-constant ERR_PORTAL_NOT_FOUND u102)
(define-constant ERR_INVALID_INPUT u103)
(define-constant ERR_ALREADY_REGISTERED u104)
(define-constant ERR_ADMIN_REQUIRED u105)

;; Contract Owner
(define-data-var contract-owner principal tx-sender)

;; User Profile Map
(define-map users 
  principal 
  {
    username: (string-ascii 50),
    role: (string-ascii 20),
    is-active: bool
  }
)

;; Metaverse Portal Map
(define-map portals 
  (string-ascii 50)
  {
    name: (string-ascii 100),
    description: (string-utf8 500),
    owner: principal,
    is-active: bool
  }
)

;; Navigation History Map
(define-map navigation-history 
  principal 
  {
    last-portal: (optional (string-ascii 50)),
    total-visits: uint,
    recent-timestamps: (list 10 uint)
  }
)

;; Authorization Check: Is Contract Owner
(define-private (is-contract-owner (sender principal))
  (is-eq sender (var-get contract-owner))
)

;; Authorization Check: Is Admin Role
(define-private (is-admin (user principal))
  (match (map-get? users user)
    userInfo (is-eq (get role userInfo) "admin")
    false
  )
)

;; Register a New User
(define-public (register-user (username (string-ascii 50)) (role (string-ascii 20)))
  (begin
    ;; Validate input
    (asserts! (> (len username) u0) (err ERR_INVALID_INPUT))
    (asserts! 
      (or 
        (is-eq role "user") 
        (is-eq role "admin")
      ) 
      (err ERR_INVALID_INPUT)
    )
    
    ;; Check if user already exists
    (asserts! 
      (is-none (map-get? users tx-sender)) 
      (err ERR_ALREADY_REGISTERED)
    )
    
    ;; Register user
    (map-set users tx-sender {
      username: username,
      role: role,
      is-active: true
    })
    
    (ok true)
  )
)

;; Get User Profile
(define-read-only (get-user-profile (user principal))
  (map-get? users user)
)

;; Register Metaverse Portal (Admin Only)
(define-public (register-portal 
  (portal-id (string-ascii 50)) 
  (name (string-ascii 100)) 
  (description (string-utf8 500))
)
  (begin
    ;; Only admins can register portals
    (asserts! (is-admin tx-sender) (err ERR_ADMIN_REQUIRED))
    
    ;; Validate inputs
    (asserts! (> (len portal-id) u0) (err ERR_INVALID_INPUT))
    (asserts! (> (len name) u0) (err ERR_INVALID_INPUT))
    
    ;; Check portal doesn't already exist
    (asserts! 
      (is-none (map-get? portals portal-id)) 
      (err ERR_ALREADY_REGISTERED)
    )
    
    ;; Register portal
    (map-set portals portal-id {
      name: name,
      description: description,
      owner: tx-sender,
      is-active: true
    })
    
    (ok true)
  )
)

;; Log User Navigation
(define-public (log-navigation (portal-id (string-ascii 50)))
  ;; Validate portal exists
  (asserts! 
    (is-some (map-get? portals portal-id)) 
    (err ERR_PORTAL_NOT_FOUND)
  )
  
  ;; Get or create default navigation history
  (let (
    (current-history 
      (default-to 
        {
          last-portal: none, 
          total-visits: u0, 
          recent-timestamps: (list)
        } 
        (map-get? navigation-history tx-sender)
      )
    )
    (current-time block-height)
    (updated-timestamps 
      (if (< (len (get recent-timestamps current-history)) u10)
        (unwrap-panic 
          (as-max-len? 
            (append (get recent-timestamps current-history) current-time) 
            u10
          )
        )
        ;; When list is full, remove first element and append new time
        (unwrap-panic 
          (as-max-len? 
            (append 
              (unwrap-panic 
                (as-max-len? 
                  (filter 
                    (lambda (x) 
                      (not (is-eq x (unwrap-panic (element-at (get recent-timestamps current-history) u0))))
                    ) 
                    (get recent-timestamps current-history)
                  ) 
                  u9
                )
              ) 
              current-time
            ) 
            u10
          )
        )
      )
    )
  )
    ;; Update navigation history
    (map-set navigation-history tx-sender {
      last-portal: (some portal-id),
      total-visits: (+ (get total-visits current-history) u1),
      recent-timestamps: updated-timestamps
    })
    
    (ok true)
  )
)

;; Get Navigation History
(define-read-only (get-navigation-history (user principal))
  (map-get? navigation-history user)
)

;; Transfer Contract Ownership (Owner Only)
(define-public (transfer-ownership (new-owner principal))
  (begin
    (asserts! (is-contract-owner tx-sender) (err ERR_UNAUTHORIZED))
    (var-set contract-owner new-owner)
    (ok true)
  )
)

;; Initialize Contract
(var-set contract-owner tx-sender)