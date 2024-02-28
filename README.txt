{
  Notification {
    from: senderId,
    to: userId;,
    type: "newFollower" || "newComment" || "newMessage",
    message: string,
    post: id,
    chat: id,
    message: id, // last unread message
    seen: false,
  }
}

Server
Fix corsOptions.js
Handle notification system
Handle images size

Client
add titles
problem with logout and browser cache and logout in Authentication


# Current
─AdminDashboard
│   └───components
│       ├───Header
│       ├───PostCard
│       ├───Posts
│       ├───ReportCard
│       ├───Reports
│       ├───UserCard
│       └───Users
├───Chat
│   └───components
│       ├───ChatCard
│       ├───ChatInformation    
│       ├───Chats
│       ├───CreateChat
│       ├───CreateGroupChat    
│       ├───MessageCard        
│       ├───SelectedChat       
│       ├───SendMessageController
│       └───UpdateGroup        

├───Settings
│   └───components
│       ├───CommentCard        
│       ├───Controllers        
│       ├───CreatedComments    
│       ├───CreatedPosts       
│       ├───Followers
│       ├───Followings
│       ├───LikedPosts
│       ├───PostCard
│       ├───PostsViewer        
│       ├───ReportCard
│       ├───Reports
│       ├───SavedPosts
│       ├───UpdateComment      
│       ├───UserCard
│       └───UsersViewer        



# Finished
├───ServerError
├───NoServerResponse
├───Unauthorized
├───NoResourceFound
├───NoTFoundPage
├───CreatePost
├───UpdatePost
├───Post
│   └───components
│       ├───CommentCard
│       ├───Comments
│       ├───PostControllers
│       └───UpdateComment
├───CreateReport
├───UpdateReport
└───Report
├───MainContent
│   └───components
│       └───Sidebar
├───Search
├───Explore
├───Home
│   └───components
│       ├───Followings
│       ├───SuggestedPosts
│       ├───SuggestedUserCard
│       └───SuggestedUsers
├───Notifications
├───Profile
│   └───components
│       ├───DeleteAccount
│       └───PostsViewer
├───UpdateProfile
│   └───components
│       ├───DeleteAccount
│       ├───UpdateAvatar
│       ├───UpdatePassword
│       └───UpdateUserInfo


# Having problem
├───Authentication
│   └───components
│       ├───Login
│       └───Register