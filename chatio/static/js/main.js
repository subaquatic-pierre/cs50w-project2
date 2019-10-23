document.addEventListener('DOMContentLoaded', () => {
    
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    let room ;
    // Wish to join room on login form submit but cant figure it out!
    // joinRoom('scuba'); This makes user join room on evey refresh NO GOOD!

    // ===== SOCKETIO EVENTS =====

    // Receive message from server
    socket.on('message', data => {
        if (data.msg) {
            const p = document.createElement('p');
            const br = document.createElement('br');        
            const username_span = document.createElement('span');
            const time_span = document.createElement('span');            
            // Check if user message or other message and assing CSS classes
            if (data.username == username) {
                p.setAttribute('class', 'my-msg')
                username_span.setAttribute('class', 'my-name')
            } else {
                p.setAttribute('class', 'other-msg')
                username_span.setAttribute('class', 'other-name')
            }
            // If join room
            if (data.join_room === true) {
                console.log(data.user_current_room)
            }
            // Check if leave room or join room message
            if (data.leave_room == true || data.join_room == true) {
                // Dont has has left message to user           
            } else {
                // Assign values from server data
                time_span.innerHTML = data.time_stamp;
                username_span.innerHTML = data.username;
                // Build p element to append to main chat div
                p.innerHTML = username_span.outerHTML + ':' + br.outerHTML + data.msg + br.outerHTML + time_span.outerHTML;
                // Append p element ti div
                document.querySelector('#main-chat').append(p);
            }            
        } else {
            printSysMsg(data.msg)
        }        
    });

    // join event received from server
    socket.on('join', data => {
        // update user list in that room
        updateUserList(data);
        // if its user that left room dont print leave message to their chat
        if (!(data.leave_room === true && data.username === username)) {
            printSysMsg(data.msg);                    
        }             
    })
    
    // Leave event received from server
    socket.on('leave', data => {
        // update user list for that  room
        updateUserList(data);      
        // if its user that left room dont print leave message to their chat
        if (!(data.leave_room === true && data.username === username)) {
            printSysMsg(data.msg)                    
        }             
    })

    // Create room event receive from server

    // ===== CLICK BUTTON EVENTS =====

    // Send message to server on message form submit
    document.querySelector('#messageForm').addEventListener('submit', e => {
        e.preventDefault();
        if (document.querySelector('#message').value != '') {
            socket.send({
                'username': username, 
                'msg': document.querySelector('#message').value,
                'room': room
                });
            document.querySelector('#message').value = '';
        }        
    });

    // Change room on click rooms sidebar list event
    document.querySelectorAll('.room-list').forEach(li => {
        li.onclick = () => {
            let newRoom = li.innerHTML;
            if (newRoom == room) {
                msg = `You are already in ${room} room.`;
                printSysMsg(msg);
            } else {
                leaveRoom(room)
                joinRoom(newRoom)
                room = newRoom;
            }
        }
    });

    // Private message when click on username
    document.querySelectorAll('.user-list').forEach(li => {
        li.onclick = () => {
            let newRoom = li.innerHTML;
            if (newRoom == room) {
                msg = `You are already in ${room} room.`;
                printSysMsg(msg);
            } else {
                createRoom(newRoom)
                leaveRoom(room)
                joinRoom(newRoom)
                room = newRoom;
            }
        }
    });

    // On click logout user leave chat room
    document.querySelector('#logout-btn').addEventListener('click', function() {
        leaveRoom(room);
    });

    // Leave room button click
    document.querySelector('#leave-room').addEventListener('click', function() {
        leaveRoom(room);
    });

    // Crate room button click
    document.querySelector('#create-room').addEventListener('click', function() {
        createRoom(room);
    });






    // ===== ROOM FUNCTIONS =====

    // Leave room function used in leave room click event
    function leaveRoom(room) {
        socket.emit('leave', {'username': username, 'room': room});
        document.querySelector('#main-chat').innerHTML = '';
        // Autofocus message input
        document.querySelector('#message').focus();
    };
    
    // Join room function used on join room click event
    function joinRoom(room) {
        socket.emit('join', {'username': username, 'room': room});
        // Clear messages
        document.querySelector('#main-chat').innerHTML = '';
        // Autofocus message input
        document.querySelector('#message').focus();
    };

    // Create room function
    function createRoom(room) {
        // emit create room event
        socket.emit('create', {'username': username, 'room': room})
        // Clear messages
        document.querySelector('#main-chat').innerHTML = '';
        // Autofocus message input
        document.querySelector('#message').focus();
    }

    // ===== UTILS =====

    // Print sytem messages such as already connected to the room or user connected
    function printSysMsg(msg) {
        const p = document.createElement('p');
        p.setAttribute('class', 'sys-msg');
        p.innerHTML = msg;        
        document.querySelector('#main-chat').append(p);
        // Autofocus message input
        document.querySelector('#message').focus();
    };

    // Update the user list on user join room or user leave room
    function updateUserList(data){     
        console.log(`Data['room']: ${data['room']}, Data['users]: ${data['users']}`)
        const usernames = data['users']
        userList = document.querySelector('#user-list');
        userList.innerHTML = '';
        // Make sure user in in room before pupulating list
        if (data['room']){
            usernames.forEach(function(username){
                const li = document.createElement('li');
                li.setAttribute('class', 'list-group-item user-list');
                userList.appendChild(li);
                li.innerHTML += username
            });
        }        
    }

});


