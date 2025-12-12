# Hokm Royale API Specification

This document outlines the REST API endpoints required for the Hokm Royale application.

**Base URL**: `https://api.hokmroyale.com/v1`

## 1. Authentication & User Management

### 1.1 Login / Register
**POST** `/auth/login`
Authenticates a user based on device ID or phone number. Creates a new user if one doesn't exist.

**Request Body:**
```json
{
  "deviceId": "string",
  "phone": "string (optional)",
  "name": "string (optional, for registration)",
  "age": "number (optional)",
  "gender": "male | female | other (optional)"
}
```

**Response (200 OK):**
```json
{
  "token": "jwt_token_string",
  "user": {
    "id": "user_123",
    "name": "Ali",
    "coins": 100,
    "level": 5,
    "avatar": "url"
  }
}
```

### 1.2 Get Profile
**GET** `/user/me`
Retrieves the current user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "id": "user_123",
  "name": "Ali",
  "age": 25,
  "gender": "male",
  "coins": 150,
  "wins": 10,
  "losses": 5,
  "level": 2,
  "avatar": "url"
}
```

### 1.3 Update Profile
**PUT** `/user/profile`
Updates user details.

**Request Body:**
```json
{
  "name": "New Name",
  "avatar": "new_avatar_url"
}
```

## 2. Social Features

### 2.1 Get Friends List
**GET** `/friends`
Returns a list of friends.

**Response (200 OK):**
```json
[
  {
    "id": "friend_456",
    "name": "Reza",
    "avatar": "url",
    "level": 10,
    "status": "online"
  }
]
```

### 2.2 Add Friend Request
**POST** `/friends/request`
Sends a friend request.

**Request Body:**
```json
{ "userId": "target_user_id" }
```

### 2.3 Game Request
**POST** `/game/request`
Invites a friend to a game.

**Request Body:**
```json
{ "friendId": "friend_456", "message": "Let's play!" }
```

### 2.4 Block User
**POST** `/users/block`
Blocks a user.

**Request Body:**
```json
{ "userId": "target_user_id" }
```

## 3. Game Logic

### 3.1 Matchmaking
**POST** `/game/matchmake`
Finds a game room.

**Request Body:**
```json
{ "mode": "online | friends", "bet": 100 }
```

**Response (200 OK):**
```json
{ "roomId": "room_xyz", "serverUrl": "wss://game.hokmroyale.com/room_xyz" }
```

### 3.2 Game State (Polling/Snapshot)
**GET** `/game/{roomId}/state`
Gets the current table state (if not using WebSocket).

**Response:**
```json
{
  "phase": "playing",
  "turn": "user_id",
  "tableCards": [ ... ],
  "scores": { "team1": 2, "team2": 1 }
}
```

### 3.3 Play Card
**POST** `/game/{roomId}/play`
Plays a card.

**Request Body:**
```json
{ "cardId": "rank-suit" }
```

### 3.4 Select Hokm
**POST** `/game/{roomId}/hokm`
Sets the trump suit.

**Request Body:**
```json
{ "suit": "hearts" }
```

## 4. Store

### 4.1 Purchase Coins
**POST** `/store/purchase`
Initiates a purchase.

**Request Body:**
```json
{ "packageId": "pkg_100_coins" }
```

**Response:**
```json
{ "paymentUrl": "https://bank..." }
```
