# Notification Structure Testing

## New Notification Structure
```javascript
{
    recipient: userId,
    sender: notification.senderId,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    data: {
        postId: notification.data?.postId,
        chatRoomId: notification.data?.chatRoomId,
        messageId: notification.data?.messageId,
        commentId: notification.data?.commentId
    },
    isDelivered: response.successCount > 0,
    deliveredAt: response.successCount > 0 ? new Date() : null,
    fcmResponse: {
        messageId: response.responses[0]?.messageId,
        error: response.responses[0]?.error?.message || response.responses[0]?.error
    }
}
```

## Test Cases for Notification Click Behavior

### 1. Message Notifications
- **Type**: `message`
- **Expected Navigation**: `/messages?chat=${chatRoomId}&highlight=${messageId}`
- **Highlighting**: Message with `messageId` should be highlighted for 3 seconds

### 2. Comment Notifications  
- **Type**: `comment`
- **Expected Navigation**: `/post/${postId}?highlight=${commentId}`
- **Highlighting**: Comment with `commentId` should be highlighted for 3 seconds

### 3. Like/Share Notifications
- **Type**: `like` or `share`
- **Expected Navigation**: `/post/${postId}`
- **Highlighting**: None (navigate to post)

### 4. Follow Notifications
- **Type**: `follow`
- **Expected Navigation**: `/user/${senderId}`
- **Highlighting**: None (navigate to user profile)

### 5. Chat Creation Notifications
- **Type**: `chat_created`, `group_created`, `group_added`
- **Expected Navigation**: `/messages?chat=${chatRoomId}`
- **Highlighting**: None (open specific chat)

### 6. Permission Request Notifications
- **Type**: `chat_permission_request`
- **Expected Navigation**: `/messages?view=requests`
- **Highlighting**: None (open permission requests view)

## Implementation Details

### PostPage.jsx
- Added URL parameter parsing for `highlight`
- Added scroll-to and highlight functionality for comments
- Highlighting uses yellow background for 3 seconds

### Messaging.jsx  
- Added URL parameter parsing for `chat` and `highlight`
- Added scroll-to and highlight functionality for messages
- Highlighting uses blue background for 3 seconds

### CommentCard.jsx
- Added `data-comment-id` attribute for targeting

### MessageBubble.jsx
- Added `data-message-id` attribute for targeting

### NotificationsPage.jsx
- Updated `handleNotificationClick` to use new notification structure
- Proper data extraction: `const { data, type, sender } = notification`
- Fallback handling for different notification sources
