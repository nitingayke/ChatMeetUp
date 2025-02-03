const loginUser = {
    "_id": "123456789",
    "username": "Nitin123",
    "email": "john_doe@example.com",
    "password": "hashed_password",
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoFRQjM-wM_nXMA03AGDXgJK3VeX7vtD3ctA&s",
    "description": "Software Developer and tech enthusiast.",
    "connections": [
        {
            "_id": "conn1",
            "user1": "Nitin123",
            "user2": {
                "_id": "user2",
                "username": "jane_smith",
                "email": "jane_smith@example.com",
                "password": "hashed_password",
                "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoFRQjM-wM_nXMA03AGDXgJK3VeX7vtD3ctA&s",
                "description": "UI/UX Designer",
                "connections": [],
                "groups": [],
                "blockUser": []
            },
            "messages": [
                {
                    "_id": "chat1",
                    "sender": "Nitin123",
                    "message": "Hey Jane, how are you?",
                    "attachments": {},
                    "reactions": [],
                    "readBy": ["user2", "user2"],
                    "deleteBy": [],
                    "createdAt": "2025-01-30T10:00:00.000Z",
                    "updatedAt": "2025-01-31T10:00:00.000Z"
                },
                {
                    "_id": "chat2",
                    "sender": "user2",
                    "message": "Hey John, I'm good! How about you?",
                    "attachments": {},
                    "reactions": [],
                    "readBy": [],
                    "deleteBy": [],
                    "createdAt": "2025-01-31T10:05:00.000Z",
                    "updatedAt": "2025-01-31T10:05:00.000Z"
                }
            ]
        },
        {
            "_id": "conn2",
            "user1": "Nitin123",
            "user2": {
                "_id": "user3",
                "username": "michael_clark",
                "email": "michael_clark@example.com",
                "password": "hashed_password",
                "image": "https://c8.alamy.com/comp/2J6HR28/cyber-criminal-arrest-unrecognizable-hooded-person-with-handcuffs-digitally-enhanced-with-glitch-effect-selective-focus-2J6HR28.jpg",
                "description": "Backend Engineer",
                "connections": [],
                "groups": [],
                "blockUser": []
            },
            "messages": []
        },
        {
            "_id": "conn3",
            "user1": "Nitin123",
            "user2": {
                "_id": "user4",
                "username": "emily_jones",
                "email": "emily_jones@example.com",
                "password": "hashed_password",
                "image": "https://example.com/emily.jpg",
                "description": "Project Manager",
                "connections": [],
                "groups": [],
                "blockUser": []
            },
            "messages": []
        }
    ],
    "groups": [
        {
            "_id": "group1",
            "name": "Tech Enthusiasts",
            "image": "https://i.pinimg.com/564x/d4/8c/2d/d48c2de0debd3bef102256f979862bbd.jpg",
            "description": "A group for tech lovers.",
            "members": [
                {
                    "user": "user1",
                    "role": "admin"
                },
                {
                    "user": "user2",
                    "role": "member"
                },
                {
                    "user": "user3",
                    "role": "member"
                },
                {
                    "user": "user4",
                    "role": "member"
                }
            ],
            "messages": [
                {
                    "_id": "chat3",
                    "sender": "Nitin123",
                    "message": "Welcome to Tech Enthusiasts!",
                    "attachments": {},
                    "reactions": [],
                    "readBy": ["user2", "user3", "user4", "user1"],
                    "deleteBy": [],
                    "createdAt": "2025-01-31T10:10:00.000Z",
                    "updatedAt": "2025-01-31T10:10:00.000Z"
                }
            ]
        },
        {
            "_id": "group2",
            "name": "Developers Hub",
            "image": "https://images.pexels.com/photos/853168/pexels-photo-853168.jpeg?cs=srgb&dl=pexels-minan1398-853168.jpg&fm=jpg",
            "description": "Discuss everything about coding.",
            "members": [
                {
                    "user": "user1",
                    "role": "admin"
                },
                {
                    "user": "user3",
                    "role": "member"
                },
                {
                    "user": "user5",
                    "role": "member"
                }
            ],
            "messages": []
        }
    ],
    "blockUser": ["user5"]
};

export default loginUser;
