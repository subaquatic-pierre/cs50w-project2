document.addEventListener('DOMContentLoaded', () => {
    
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    
    onPageLoadListenerEvents();

    const chatDiv = document.querySelector('#main-chat');
    let username, room, all_rooms;
    let active_users = [];

    // // Login user if local storage has username
    // if (localStorage.getItem('localUsername')){
    //     if (localStorage.getItem('localRoom')) {
    //         username = localStorage.getItem('localUsername');
    //         room = localStorage.getItem('localRoom');
    //         joinRoom(room);
    //     } else {            
    //         room = 'scuba';
    //         joinRoom(room);
    //     }
    // } else {
    //     // Join room on user login form submit
    //     document.querySelector('#login-form').onsubmit = e => {
    //     e.preventDefault();
    //     formusername = document.querySelector('#username').value
    //     localStorage.setItem('localUsername', formusername)
    //     // Check if room in local storage
    //     if (localStorage.getItem('localRoom')) {
    //         room = localStorage.getItem('localRoom');
    //     } else {
    //         room = 'scuba';
    //     }
    //         socket.emit('login', {'username': formusername, 'room': room})
    //     }
    // }

    // ===== SOCKETIO EVENTS FROM SERVER =====

    // Receive message from server
    socket.on('message', data => {        
        if (data.msg) {
            console.log(`MESSAGE RECEIVED, username: ${data.username}, room: ${data.room}`);
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
            // Check if leave room or join room message, Dont send has left message to user 
            if (!(data.leave_room == true || data.join_room == true)) {
                // Assign values from server data
                time_span.innerHTML = data.time_stamp;
                username_span.innerHTML = data.username;
                // Build p element to append to main chat div
                p.innerHTML = username_span.outerHTML + ':' + br.outerHTML + data.msg + br.outerHTML + time_span.outerHTML;
                // Append p element ti div
                chatDiv.append(p);
                chatDiv.scrollTop = chatDiv.scrollHeight;
            }     
        } else {
            printSysMsg(data.msg)
        }        
    });

    // login event received from server
    socket.on('login', data => {
        console.log(`LOGIN RECEIVED, username: ${data.username}, room: ${data.room}`);
        updateUserList(data);  
        updateMessages(data);
        updateRoomList(data['rooms']);
        printSysMsg(data.msg);            
        active_users = data['users'];
        console.log(active_users);
        username = data.username;  
        localStorage.setItem('localUsername', username);
        localStorage.setItem('localRoom', data['room']);     
    });

    // join event received from server
    socket.on('join', data => {
        console.log(`JOIN RECEIVED, username: ${data.username}, room: ${data.room}`)
        updateUserList(data);
        if (data.username === username) {
            updateMessages(data);
            updateRoomList(data['rooms']);
        }
        printSysMsg(data.msg);        
        leave_room = false;       
        localStorage.setItem('localRoom', data['room']);     
    });
    
    // Leave event received from server
    socket.on('leave', data => {
        console.log(`LEAVE RECEIVED, username: ${data.username}, room: ${data.room}`)
        // update user list for that  room
        document.querySelector('#user-list').innerHTML = '';
        updateUserList(data);
        printSysMsg(data.msg);
        leave_room = true;
        localStorage.removeItem('localRoom');
    });

    // Create room event receive from server
    socket.on('create', data => {
        console.log(`CREATE RECEIVED, username: ${data.username}, room: ${data.room}`)
        // of same user as created room then user join room
        if (data.username == username){
            room = data.room;
            joinRoom(data.room);
            updateUserList(data);
        }
        updateRoomList(data['rooms']);   
    });

    // Leave event received from server
    socket.on('logout', data => {
        console.log(`LOGOUT RECEIVED`)
        // update user list for that  room
        document.querySelector('#main-chat').innerHTML = '';
        document.querySelector('#room-list').innerHTML = '';
        document.querySelector('#user-list').innerHTML = '';
        printSysMsg(data.msg);
        leave_room = true;
        active_users = data['users'];
        localStorage.removeItem('localRoom')
        localStorage.removeItem('localUsername')
    })

    // Private message when click on username
    // document.querySelectorAll('.user-list').forEach(li => {
    //     li.onclick = () => {
    //         let newRoom = li.innerHTML;
    //         if (newRoom == room) {
    //             msg = `You are already in ${room} room.`;
    //             printSysMsg(msg);
    //         } else {
    //             createRoom(newRoom)
    //             if (room != undefined){
    //                 leaveRoom(room)
    //             }                
    //             joinRoom(newRoom)
    //             room = newRoom;
    //         }
    //     }
    // });



    // ===== ROOM FUNCTIONS =====

    // Leave room function used in leave room click event
    function leaveRoom(room) {
        // Server will always receive a room to leave from otherwise user is not in a room and cannot send request
        if (room != undefined){
            socket.emit('leave', {'username': username, 'room': room});
            document.querySelector('#main-chat').innerHTML = '';
            // Autofocus message input
            document.querySelector('#message').focus();    
        } else {
            msg = 'You need to be in a room to leave a room';
            printSysMsg(msg)
        }
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
        chatDiv.append(p);
        chatDiv.scrollTop = chatDiv.scrollHeight;
        // Autofocus message input
        document.querySelector('#message').focus();
    };

    // Update the user list on user join room or user leave room
    function updateUserList(data){     
        const usernames = data['users'];
        userList = document.querySelector('#user-list');
        userList.innerHTML = '';
        // Make sure user in in room before pupulating list
        if (room){
            usernames.forEach(function(username){
                const li = document.createElement('li');
                li.setAttribute('class', 'list-group-item user-list');
                li.innerHTML = username;
                userList.append(li);
            });
        }        
    }

    // Update the update room list on user join or room create
    function updateRoomList(data){     
        const rooms = data
        roomList = document.querySelector('#room-list');
        roomList.innerHTML = '';
        rooms.forEach(function(room){
            const li = document.createElement('li');
            li.setAttribute('class', 'list-group-item room-list');
            // make first letter of each room uppercase
            li.innerHTML = room.charAt(0).toUpperCase() + room.slice(1);
            roomList.append(li);
            });      
        // add listener event to all rooms in the list
        document.querySelectorAll('.room-list').forEach(li => {
            li.onclick = () => {
                let newRoom = li.innerHTML;
                if (newRoom == room) {
                    msg = `You are already in ${room} room.`;
                    printSysMsg(msg);
                } else {
                    leaveRoom(room);
                    joinRoom(newRoom);      
                    room = newRoom;
                };
            };
        });
    };

    // Update message list on user join room
    function updateMessages(data) {
        chatDiv.innerHTML = '';
        if (data.all_msgs) {
            for (var i = 0; i < data.all_msgs.length; i++) {
                const p = document.createElement('p');
                const br = document.createElement('br');        
                const username_span = document.createElement('span');
                const time_span = document.createElement('span');                           
                // Check if user message or other message and assing CSS classes
                if (data.all_msgs[i].username == username) {
                    p.setAttribute('class', 'my-msg');
                    username_span.setAttribute('class', 'my-name');
                } else {
                    p.setAttribute('class', 'other-msg');
                    username_span.setAttribute('class', 'other-name');
                }    
                time_span.innerHTML = data.all_msgs[i].time;
                username_span.innerHTML = data.all_msgs[i].username;
                // Build p element to append to main chat div
                p.innerHTML = username_span.outerHTML + ':' + br.outerHTML + data.all_msgs[i].msg + br.outerHTML + time_span.outerHTML;
                // Append p element ti div
                chatDiv.append(p);
                chatDiv.scrollTop = chatDiv.scrollHeight;
            };
        };
    };

    // ===== LISTENR EVENTS ONPAGE LOAD =====

    function onPageLoadListenerEvents() {

        // Log out button click
        document.querySelector('#logout-btn').onclick = () => {
            console.log('Logout Button: ' + username);
            console.log('Active Users: ', active_users);
            // check user is logged in
            for (var i = 0; i < active_users.length; i++) {
                if (username === active_users[i]){
                socket.emit('logout', {'username': username, 'room': room});
                break;
                };
            };
            msg = 'You need to be logged in for that';
            printSysMsg(msg);
        };

        // Join room on user login form submit
        document.querySelector('#login-form').onsubmit = e => {
            e.preventDefault();
            username = document.querySelector('#username').value;
            room = 'scuba';
            socket.emit('login', {'username': username, 'room': room})
        }

        // Send message to server on message form submit
        document.querySelector('#messageForm').addEventListener('submit', e => {
            e.preventDefault();
            // Mkae sure input is not blacnk and user is in a room
            if (document.querySelector('#message').value != '') {
                if (room === undefined){
                    msg = 'You need to be in a room to send a message';
                    printSysMsg(msg);
                } else {
                    socket.send({
                        'username': username, 
                        'msg': document.querySelector('#message').value,
                        'room': room
                        });                
                }
                document.querySelector('#message').value = '';            
            }
        });

        // add listener event to allrooms in the list
        document.querySelectorAll('.room-list').forEach(li => {
            li.onclick = () => {
                let newRoom = li.innerHTML;
                if (newRoom == room) {
                    msg = `You are already in ${room} room.`;
                    printSysMsg(msg);
                } else {
                    leaveRoom(room);
                    joinRoom(newRoom);      
                    room = newRoom;
                }
            }
        });

        // Leave room button click
        document.querySelector('#leave-room').addEventListener('click', function() {
            leaveRoom(room);
            room = undefined;
        });

        // Create room button click
        document.querySelector('#create-room').addEventListener('click', function() {
            // Make sure user is active
            for (var i = 0; i < active_users.length; i++) {
                if (username === active_users[i]){
                //check string in field
                    if (!document.querySelector('#room-name').value == '') {              
                        leaveRoom(room);
                        createRoom(document.querySelector('#room-name').value);
                    } else { // alert room needs a name
                        alert('Room must have a name');
                    };
                    break;
                };
            }
            msg = 'You need to be logged in for that';
            printSysMsg(msg);
        });
    };
    
});