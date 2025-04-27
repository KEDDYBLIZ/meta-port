import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.2/index.ts';
import { assertEquals } from 'https://deno.land/std@0.170.0/testing/asserts.ts';

// User Registration Tests
Clarinet.test({
  name: "User Registration: Successful User Registration",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const block = chain.mineBlock([
      Tx.contractCall("meta-port", "register-user", 
        [types.ascii("testuser"), types.ascii("user")], 
        deployer.address)
    ]);

    // Verify successful registration
    block.receipts[0].result.expectOk().expectBool(true);

    // Verify user profile was created
    const userProfile = chain.callReadOnlyFn(
      "meta-port", 
      "get-user-profile", 
      [types.principal(deployer.address)], 
      deployer.address
    );
    userProfile.result.expectSome();
  }
});

Clarinet.test({
  name: "User Registration: Prevent Duplicate Registration",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const block = chain.mineBlock([
      // First registration
      Tx.contractCall("meta-port", "register-user", 
        [types.ascii("testuser"), types.ascii("user")], 
        deployer.address),
      // Attempt duplicate registration
      Tx.contractCall("meta-port", "register-user", 
        [types.ascii("testuser"), types.ascii("user")], 
        deployer.address)
    ]);

    // First registration should succeed
    block.receipts[0].result.expectOk().expectBool(true);
    
    // Second registration should fail with ERR_ALREADY_REGISTERED
    block.receipts[1].result.expectErr().expectUint(104);
  }
});

Clarinet.test({
  name: "User Registration: Invalid Parameter Checks",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    
    // Test empty username
    const emptyUsernameBlock = chain.mineBlock([
      Tx.contractCall("meta-port", "register-user", 
        [types.ascii(""), types.ascii("user")], 
        deployer.address)
    ]);
    emptyUsernameBlock.receipts[0].result.expectErr().expectUint(103);

    // Test invalid role
    const invalidRoleBlock = chain.mineBlock([
      Tx.contractCall("meta-port", "register-user", 
        [types.ascii("testuser"), types.ascii("invalid")], 
        deployer.address)
    ]);
    invalidRoleBlock.receipts[0].result.expectErr().expectUint(103);
  }
});

// Portal Management Tests
Clarinet.test({
  name: "Portal Registration: Admin Portal Registration",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    
    // First, register as admin
    const registerAdminBlock = chain.mineBlock([
      Tx.contractCall("meta-port", "register-user", 
        [types.ascii("admin"), types.ascii("admin")], 
        deployer.address)
    ]);
    registerAdminBlock.receipts[0].result.expectOk();

    // Register portal
    const portalBlock = chain.mineBlock([
      Tx.contractCall("meta-port", "register-portal", 
        [
          types.ascii("test-portal"), 
          types.ascii("Test Portal"), 
          types.utf8("A test portal description")
        ], 
        deployer.address)
    ]);
    portalBlock.receipts[0].result.expectOk().expectBool(true);
  }
});

Clarinet.test({
  name: "Portal Registration: Non-Admin Attempt Blocked",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const account1 = accounts.get("wallet_1")!;
    
    // Attempt portal registration without admin role
    const portalBlock = chain.mineBlock([
      Tx.contractCall("meta-port", "register-portal", 
        [
          types.ascii("test-portal"), 
          types.ascii("Test Portal"), 
          types.utf8("A test portal description")
        ], 
        account1.address)
    ]);
    portalBlock.receipts[0].result.expectErr().expectUint(105);
  }
});

// Navigation Tracking Tests
Clarinet.test({
  name: "Navigation Tracking: Successful Navigation Logging",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    
    // First, register admin and portal
    const setupBlock = chain.mineBlock([
      Tx.contractCall("meta-port", "register-user", 
        [types.ascii("admin"), types.ascii("admin")], 
        deployer.address),
      Tx.contractCall("meta-port", "register-portal", 
        [
          types.ascii("test-portal"), 
          types.ascii("Test Portal"), 
          types.utf8("A test portal description")
        ], 
        deployer.address)
    ]);

    // Log navigation
    const navigationBlock = chain.mineBlock([
      Tx.contractCall("meta-port", "log-navigation", 
        [types.ascii("test-portal")], 
        deployer.address)
    ]);
    navigationBlock.receipts[0].result.expectOk().expectBool(true);

    // Verify navigation history
    const navHistory = chain.callReadOnlyFn(
      "meta-port", 
      "get-navigation-history", 
      [types.principal(deployer.address)], 
      deployer.address
    );
    
    // Check that history was recorded
    navHistory.result.expectSome();
  }
});

Clarinet.test({
  name: "Navigation Tracking: Multiple Portal Visits",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    
    // First, register admin and portals
    const setupBlock = chain.mineBlock([
      Tx.contractCall("meta-port", "register-user", 
        [types.ascii("admin"), types.ascii("admin")], 
        deployer.address),
      Tx.contractCall("meta-port", "register-portal", 
        [
          types.ascii("portal1"), 
          types.ascii("Portal 1"), 
          types.utf8("First test portal")
        ], 
        deployer.address),
      Tx.contractCall("meta-port", "register-portal", 
        [
          types.ascii("portal2"), 
          types.ascii("Portal 2"), 
          types.utf8("Second test portal")
        ], 
        deployer.address)
    ]);

    // Log multiple portal navigations
    const navigationBlock = chain.mineBlock([
      Tx.contractCall("meta-port", "log-navigation", 
        [types.ascii("portal1")], 
        deployer.address),
      Tx.contractCall("meta-port", "log-navigation", 
        [types.ascii("portal2")], 
        deployer.address)
    ]);
    
    // Both navigation logs should succeed
    navigationBlock.receipts[0].result.expectOk().expectBool(true);
    navigationBlock.receipts[1].result.expectOk().expectBool(true);

    // Verify navigation history
    const navHistory = chain.callReadOnlyFn(
      "meta-port", 
      "get-navigation-history", 
      [types.principal(deployer.address)], 
      deployer.address
    );
    
    // Check that history was recorded with multiple visits
    navHistory.result.expectSome();
  }
});

// Authorization and Security Tests
Clarinet.test({
  name: "Authorization: Ownership Transfer by Non-Owner Blocked",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const account1 = accounts.get("wallet_1")!;
    
    // Attempt ownership transfer by non-owner
    const transferBlock = chain.mineBlock([
      Tx.contractCall("meta-port", "transfer-ownership", 
        [types.principal(account1.address)], 
        account1.address)
    ]);
    
    // Should be blocked with unauthorized error
    transferBlock.receipts[0].result.expectErr().expectUint(100);
  }
});

// Error Handling and Edge Cases
Clarinet.test({
  name: "Error Handling: Invalid Portal Navigation",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    
    // Attempt to log navigation to non-existent portal
    const navigationBlock = chain.mineBlock([
      Tx.contractCall("meta-port", "log-navigation", 
        [types.ascii("non-existent-portal")], 
        deployer.address)
    ]);
    
    // Should return portal not found error
    navigationBlock.receipts[0].result.expectErr().expectUint(102);
  }
});