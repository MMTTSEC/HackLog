# HackLog

# 1️⃣ User Endpoints

| Endpoint         | Method | Description         | Roles Allowed | Notes               |
| ---------------- | ------ | ------------------- | ------------- | ------------------- |
| `/api/users`     | POST   | Register a new user | visitor       | Anyone can register |
| `/api/users`     | GET    | List all users      | admin         | Admin-only          |
| `/api/users/:id` | GET    | Get user info       | admin         | Admin-only          |
| `/api/users/:id` | PUT    | Update user info    | admin         | Admin-only          |
| `/api/users/:id` | DELETE | Delete a user       | admin         | Admin-only          |


# 2️⃣ Authentication / Session Endpoints

| Endpoint        | Method | Description       | Roles Allowed      | Notes               |
| --------------- | ------ | ----------------- | ------------------ | ------------------- |
| `/api/login`    | POST   | Login user        | visitor,user,admin | Returns session     |
| `/api/logout`   | POST   | Logout user       | user,admin         | Invalidates session |
| `/api/sessions` | GET    | List all sessions | admin              | Admin-only          |


# 3️⃣ Article Endpoints

| Endpoint                 | Method | Description                             | Roles Allowed      | Notes                                                 |
| ------------------------ | ------ | --------------------------------------- | ------------------ | ----------------------------------------------------- |
| `/api/articles`          | GET    | List all articles (supports tag filter) | visitor,user,admin | Public reading, supports query params like `?tag=XSS` |
| `/api/articles/:id`      | GET    | Get single article                      | visitor,user,admin |                                                       |
| `/api/articles`          | POST   | Create new article                      | user,admin         | Backend checks session/user                           |
| `/api/articles/:id`      | PUT    | Edit article                            | user (own), admin  | Backend enforces ownership for normal users           |
| `/api/articles/:id`      | DELETE | Delete article                          | user (own), admin  | Backend enforces ownership for normal users           |
| `/api/articles/:id/like` | POST   | Like/unlike article                     | user,admin         | Toggle like for logged-in users                       |


