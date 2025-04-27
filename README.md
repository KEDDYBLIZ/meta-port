# meta-port

A decentralized portal for secure and transparent metaverse navigation using Stacks blockchain.

## Project Overview

The `meta-port` project provides a decentralized solution for users to securely navigate the metaverse. It leverages the Stacks blockchain to offer a transparent and tamper-resistant platform for managing user identities, accessing metaverse portals, and tracking navigation history.

Key features of the `meta-port` project include:

- Secure user registration and authentication
- Decentralized management of metaverse portal access
- Transparent logging of user navigation history
- Clarity-based smart contract implementation

## Contract Architecture

The `meta-port` project is built on a single Clarity smart contract that manages the core functionality of the decentralized metaverse navigation portal.

### Data Structures

The contract maintains the following key data structures:

1. **UserRegistration**: A map that stores user registration information, including their principal and a timestamp of their registration.
2. **PortalAccess**: A map that tracks which users have access to which metaverse portals.
3. **NavigationHistory**: A list that stores the recent navigation timestamps for each user, with a limit of 10 entries.

### Public Functions

The contract exposes the following public functions:

1. `register-user`: Allows a user to register with the portal, associating their principal with a registration timestamp.
2. `grant-portal-access`: Grants a user access to a specific metaverse portal.
3. `revoke-portal-access`: Revokes a user's access to a specific metaverse portal.
4. `log-navigation`: Logs a user's navigation to a metaverse portal, updating their navigation history.
5. `get-user-navigation`: Retrieves a user's recent navigation history.

### Security and Authentication

The contract implements the following security measures:

- User registration and portal access are permission-based, with the contract owner having the ability to grant and revoke access.
- Navigation history logging is restricted to authorized users who have been granted access to the specific portal.
- Strict data type validation and boundary checks are performed on all function inputs to prevent invalid or malicious data.

## Installation & Setup

To use the `meta-port` Clarity smart contract, you will need the following:

- Clarinet: A development environment for building and testing Clarity contracts
- Stacks blockchain node: To deploy and interact with the contract on the Stacks network

1. Install Clarinet by following the official [Clarinet installation guide](https://docs.clarineth.com/installation).
2. Clone the `meta-port` repository and navigate to the project directory.
3. Run `clarinet check` to ensure the project setup is correct.
4. Use `clarinet deploy` to deploy the `meta-port` contract to the Stacks blockchain.

## Usage Guide

### Registering a User

To register a new user with the `meta-port` portal, call the `register-user` function with the user's principal:

```clarity
(register-user 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)
```

This will associate the given principal with a registration timestamp in the `UserRegistration` map.

### Granting Portal Access

To grant a user access to a specific metaverse portal, call the `grant-portal-access` function with the user's principal and the portal ID:

```clarity
(grant-portal-access 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM "portal-123")
```

This will add the user's principal to the `PortalAccess` map for the specified portal.

### Logging Navigation

When a user navigates to a metaverse portal, call the `log-navigation` function with the user's principal and the portal ID:

```clarity
(log-navigation 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM "portal-123")
```

This will update the user's navigation history in the `NavigationHistory` list.

### Retrieving Navigation History

To fetch a user's recent navigation history, call the `get-user-navigation` function with the user's principal:

```clarity
(get-user-navigation 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)
```

This will return a list of the user's 10 most recent navigation timestamps.

## Testing

The `meta-port` project includes a comprehensive test suite implemented in TypeScript using the Clarinet testing framework. The tests cover the following scenarios:

- User registration
- Portal access management
- Navigation history logging
- Unauthorized access handling
- Error conditions and edge cases

To run the tests, use the following command:

```
clarinet test
```

The test suite ensures the correct behavior of the `meta-port` contract and serves as a reference for developers working on the project.

## Security Considerations

The `meta-port` contract has been designed with security in mind. Some of the key security features include:

1. **Authorization**: All state-modifying functions, such as user registration, portal access management, and navigation logging, are restricted to authorized users only.
2. **Data Validation**: Strict input validation is performed on all function parameters to prevent injection attacks and other malicious data.
3. **Navigation History Logging**: The navigation history is stored in a list with a maximum size of 10 entries, ensuring that the contract does not grow indefinitely and become vulnerable to resource exhaustion attacks.
4. **Ownership and Control**: The contract owner has the ability to grant and revoke portal access, allowing for centralized management and control of the metaverse navigation portal.

Developers working with the `meta-port` contract should always be mindful of potential security risks and follow best practices for Clarity smart contract development.
