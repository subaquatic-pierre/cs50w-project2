document.addEventListener('DOMContentLoaded', () => {
    
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    loginFormTemplate = Handlebars.compile(document.querySelector('#login-form-template').innerHTML);
    userControlsTemplate = Handlebars.compile(document.querySelector('#user-controls-template').innerHTML);
    userNameInputTemplate = Handlebars.compile(document.querySelector('#username-input-template').innerHTML);
    msgTemplate = Handlebars.compile(document.querySelector('#chat-msg-script').innerHTML);

    
    onPageLoadListenerEvents();

    const chatDiv = document.querySelector('#main-chat');
    let username, room;
    let active_users = [];
    let all_rooms = [];

    // Login user if local storage has username
    if (localStorage.getItem('localUsername')){
        // Add user controls as user is logged in
        username = localStorage.getItem('localUsername');
        document.querySelector('#user-controls').innerHTML = userControlsTemplate({username:username});
        userControlListeners();
        document.querySelector('#username-input-group').innerHTML = userNameInputTemplate({username:username});
        if (localStorage.getItem('localRoom')) {
            room = localStorage.getItem('localRoom');
        } else {            
            room = 'scuba';
        }
        socket.emit('login', {'username': username, 'room': room});
    } else {
        document.querySelector('#login-div').innerHTML = loginFormTemplate();
        loginFormListeners();
    }

    // ===== SOCKETIO EVENTS FROM SERVER =====

    // Receive message from server
    socket.on('message', data => {        
        if (data.msg) {
            let msgClass, nameClass, msgDivClass;
            // Check if user message or other message and assing CSS classes
            if (data.username === username) {
                msgClass = 'my-msg';
                nameClass = 'my-name';
                msgDivClass = 'my-msg-div';
            } else {
                msgClass = 'other-msg';
                nameClass = 'other-name';
                msgDivClass = 'other-msg-div';
            }
            // Check if leave room or join room message, Dont send has left message to user 
            if (!(data.leave_room === true || data.join_room === true)) {
                context = {'msg-class': msgClass, 'name-class': nameClass, 'time': data.time_stamp, 'msg': data.msg,'username': data.username}                         
                msgDiv = document.createElement('div')
                msgDiv.setAttribute('class', msgDivClass)
                msgDiv.innerHTML = msgTemplate(context)
                chatDiv.append(msgDiv);
                chatDiv.scrollTop = chatDiv.scrollHeight;
            }     
        } else {
            printSysMsg(data.msg)
        }        
    });

    // login event received from server
    socket.on('login', data => {
        updateUserList(data);  
        updateMessages(data);
        updateRoomList(data['rooms']);
        printSysMsg(data.msg);            
        active_users = data['users'];
        all_rooms = data['rooms'];
        if (data.username === username) {
            document.querySelector('#current-room').innerHTML = data.room.charAt(0).toUpperCase() + room.slice(1);
            localStorage.setItem('localUsername', username);
            localStorage.setItem('localRoom', data['room']);     
            username = data.username;
        }
    });

    // join event received from server
    socket.on('join', data => {
        updateUserList(data);
        if (data.username === username) {
            updateMessages(data);
            updateRoomList(data['rooms']);
        }
        printSysMsg(data.msg);        
        leave_room = false;       
        all_rooms = data['rooms'];
        // Set current room text in user control div
        document.querySelector('#current-room').innerHTML = data.room.charAt(0).toUpperCase() + room.slice(1);
        localStorage.setItem('localRoom', data['room']);
    });
    
    // Leave event received from server
    socket.on('leave', data => {
        // update user list for that  room
        document.querySelector('#user-list').innerHTML = '';
        updateUserList(data);
        printSysMsg(data.msg);
        leave_room = true;
        all_rooms = data['rooms'];
        localStorage.removeItem('localRoom');
        document.querySelector('#current-room').innerHTML = '';
    });

    // Create room event receive from server
    socket.on('create', data => {
        // of same user as created room then user join room
        if (data.username == username){
            room = data.room;
            joinRoom(data.room);
            updateUserList(data);
        }
        updateRoomList(data['rooms']);  
        all_rooms = data['rooms']; 
    });

    // Leave event received from server
    socket.on('logout', data => {
        // update user list for that  room
        if (data.username === username) {
            document.querySelector('#main-chat').innerHTML = '';
            document.querySelector('#room-list').innerHTML = '';
            document.querySelector('#user-list').innerHTML = '';
            printSysMsg(data.msg);
            leave_room = true;
            active_users = data['users'];
            localStorage.removeItem('localRoom');
            localStorage.removeItem('localUsername');
        } else {
            printSysMsg(data.msg);
        }
        document.querySelector('#username').focus();
    });


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
                let newRoom = li.innerHTML.toLowerCase();
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
                let msgClass, nameClass, msgDivClass;
                // Check if user message or other message and assing CSS classes
                if (data.all_msgs[i].username === username) {
                    msgClass = 'my-msg';
                    nameClass = 'my-name';
                    msgDivClass = 'my-msg-div';
                } else {
                    msgClass = 'other-msg';
                    nameClass = 'other-name';
                    msgDivClass = 'other-msg-div';

                }
                context = {'msg-class': msgClass, 'name-class': nameClass, 'time': data.all_msgs[i].time, 'msg': data.all_msgs[i].msg,'username': data.all_msgs[i].username}                         
                msgDiv = document.createElement('div')
                msgDiv.setAttribute('class', msgDivClass)
                msgDiv.innerHTML = msgTemplate(context)
                chatDiv.append(msgDiv);
                chatDiv.scrollTop = chatDiv.scrollHeight;
            };
        };
    };


    // ===== LISTENR EVENTS ONPAGE LOAD =====

    function onPageLoadListenerEvents() {        

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
                let newRoom = li.innerHTML.toLowerCase();
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
    };


    // ===== LISTENER EVENTS FOR USER CONTROLS =====

    function userControlListeners() {

        // Create room button click
        document.querySelector('#create-room').addEventListener('click', function() {
            let room_exists = false;
            // Make sure user is active
            for (var i = 0; i < active_users.length; i++) {
                if (username === active_users[i]){
                //check string in field
                    if (!document.querySelector('#room-name').value == '') {    
                        for (let el of all_rooms) {
                            if (el === document.querySelector('#room-name').value.toLowerCase() ) {
                                alert('Room already exists');
                                document.querySelector('#room-name').value = '';
                                return room_exists = true;
                            };
                        };
                        if (!room_exists){
                            leaveRoom(room);
                            createRoom(document.querySelector('#room-name').value);
                            document.querySelector('#room-name').value = '';
                        }
                    } else { // alert room needs a name
                        alert('Room must have a name');
                        not_room = true;
                        break;
                    };                    
                    msg = 'You need to be logged in for that';
                    printSysMsg(msg);
                };
            };            
        });

        document.querySelector('#room-name').addEventListener('keyup', e => {
            if (e.keyCode === 13) {
                document.querySelector('#create-room').click();
            };
        });

        // Leave room button click
        document.querySelector('#leave-room').addEventListener('click', function() {
            leaveRoom(room);
            room = undefined;
        });

        // Log out button click
        document.querySelector('#logout-btn').onclick = () => {
            // Remove user controls if user log out button click
            document.querySelector('#user-controls-section').remove();
            // Add login form if user hits logout button
            document.querySelector('#login-div').innerHTML = loginFormTemplate();
            // Remove username from input field
            document.querySelector('#username-input-group').innerHTML = '<input autocomplete="off" autofocus class="form-control form-control-lg" id="message" name="message" type="text" value="">';
            loginFormListeners();    
            // check user is logged in
            for (var i = 0; i < active_users.length; i++) {
                if (username === active_users[i]){
                socket.emit('logout', {'username': username, 'room': room});
                break;
                };
                msg = 'You need to be logged in for that';
                printSysMsg(msg);    
            };
        };      
    };


    // ===== LISTENER EVENTS FOR LOGIN FORM =====

    // Join room on user login form submit
    function loginFormListeners() {
        document.querySelector('#login-form').onsubmit = e => {
            e.preventDefault();
            username = document.querySelector('#username').value;
            document.querySelector('#username').value = '';
            room = 'scuba';
            // Remove login form on login
            document.querySelector('#login-div-template').remove();
            // Add user controls on login
            document.querySelector('#user-controls').innerHTML = userControlsTemplate({username:username});
            userControlListeners();
            document.querySelector('#username-input-group').innerHTML = userNameInputTemplate({username:username});
            socket.emit('login', {'username': username, 'room': room});
        };
    };

});