# Social Media App / Instagram

"Welcome to my social media app, an Instagram clone that brings the power of social media
to your fingertips! Dive into a world of sharing photos, connecting with friends, and
exploring new content."

## Introduction

This project is an Instagram clone app developed to showcase my skills in full-stack
web development. It serves as a culmination of my learnings from a medium-level course
covering Node.js, Express, MongoDB, and Socket principles. The app replicates key features
of Instagram, including user authentication, photo sharing, real-time messaging, and more.
Through this project, I aim to demonstrate my proficiency in building complex web applications
and my ability to overcome various challenges in the development process.

## Why I Chose This Idea

The choice of this project stems from my completion of a medium-level course covering
Node.js, Express, MongoDB, and Socket principles. Eager to apply my newfound knowledge,
I sought to create a project that would incorporate both fundamental and challenging
aspects of HTTP APIs and socket-based chat applications. This led me to develop
an Instagram clone, providing an opportunity to implement key features such as
user authentication, photo sharing, real-time messaging, and more.

## Project Features

- 🔒 User authentication and authorization
- 🖼️ Profile customization and control
- 📷 Uploading and sharing photos and posts
- ❤️ Liking, commenting, and interacting with posts
- 🔍 Explore page for discovering new content
- 🔎 Searching, finding, following, and discovering other users
- 🚨 Sending reports to admins
- 👨‍💼 Admin accessibility and control
- 💬 Direct messaging between users
- 📱 Variation in chats like single and group chat
- 🎮 Full control in your chats
- 🚀 Achieving accessibility, performance, and security

## Challenges and Solutions

1. Implementing authentication using JWT tokens for access and refresh tokens.
2. Managing image uploads for user avatars and posts using the Multer package then Firebase.
3. Resolving issues related to image size by implementing compression with the Sharp package.
4. Establishing a standard folder and file structure for both the server and client app.
5. Learning and integrating Socket.IO for real-time chat functionality.
6. Designing and maintaining the database schema, visualized in the ERD located at ./View/Instagram_ERD.png.
7. Utilizing Postman for API testing during development, with the collection available at ./view/Instagram.postman_collection.json.
8. Overcoming various challenges in API development, layout design, responsiveness, deployment, documentation, and testing.

## Used Technologies

- HTML
- CSS
- JavaScript
- React.js
- Node.js
- Express.js
- MongoDB
- Socket.IO
- Firebase

## Deployment

Project link: https://instagram-i8rw.onrender.com/

## Installation Instructions

To run the Instagram clone project locally, follow these steps:

1. Clone the repository to your local machine:
   git clone https://github.com/ShirefMohammed/Instagram.git

2. cd Instagram

3. npm install

4. Create .env file that contains variables:

   - DATABASE_URL=your_database_url
   - ACCESS_TOKEN_SECRET=your_access_token_secret
   - REFRESH_TOKEN_SECRET=your_refresh_token_secret
   - SERVER_URL=your_server_url
   - NODE_ENV=development
   - PORT=3000
   - FIREBASE_apiKey=your_firebase_api_key
   - FIREBASE_authDomain=your_firebase_auth_domain
   - FIREBASE_projectId=your_firebase_project_id
   - FIREBASE_storageBucket=your_firebase_storage_bucket
   - FIREBASE_messagingSenderId=your_firebase_messaging_sender_id
   - FIREBASE_appId=your_firebase_app_id
   - FIREBASE_measurementId=your_firebase_measurement_id

5. npm start

## Summary

Thank you for visiting my Instagram clone project! 🚀 I hope you enjoyed exploring
the features and functionalities I've implemented to replicate the essence of Instagram.
Your interest and support mean a lot to me, and I encourage you to give the app a try,
share it with your friends, and star the repository if you found it useful or interesting.

This project serves as a testament to my skills and dedication to full-stack web development.
With a focus on user experience, performance, and security, I've strived to create a seamless
social media experience that mirrors the functionality of Instagram while adding my own unique touches.

I'm always open to feedback, suggestions, or collaboration opportunities,
so please don't hesitate to reach out. Whether you have questions about the project,
need assistance with a similar endeavor, or are interested in discussing potential job opportunities,
I'm ready and eager to connect.

Thank you once again for your interest and support. Let's continue to build amazing things together! 🌟
