chat-app/
│
├── package.json          
├── .env                  # PORT, MONGO_URI, etc.
├── server.js             # Node.js + Express + Socket.io
│
├── src/                  # Front-end (Parcel entry)
│   ├── index.html        
│   ├── style.css         
│   └── main.js           
│
├── src/js/               # Front-end modules
│   ├── socket.js         
│   ├── ui.js             
│   └── utils.js          
│
├── models/               # MongoDB schemas
│   └── Message.js        # Example: { username, text, timestamp }
│
├── utils/                
│   └── formatMessage.js  

