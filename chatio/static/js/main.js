document.addEventListener('DOMContentLoaded', () => {
    
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    let room = 'scuba';
    const room_users = {};
    joinRoom('scuba');

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

    socket.on('room', data => {

        updateUserList(data)

        
        if (!(data.leave_room === true && data.username === username)) {
            printSysMsg(data.msg)                    
        }             
    })

    // Send message to server
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
    document.querySelectorAll('.room-list').forEach(a => {
        a.onclick = () => {
            let newRoom = a.innerHTML;
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

    function printSysMsg(msg) {
        const p = document.createElement('p');
        p.setAttribute('class', 'sys-msg');
        p.innerHTML = msg;        
        document.querySelector('#main-chat').append(p);
        // Autofocus message input
        document.querySelector('#message').focus();
    };

    function updateUserList(data){
        
        
        if (data.join_room === true) {
            console.log('join room: ' + data.room)
            for(let i = 0; i < users.length; i++){
            
                if (data.room === data.user_current_room){
                    room_users[data].push(data.username)
                }
            }
        } else if (data.leave_room === true) {
            console.log('leave room: ' + data.room)
            for(let i = 0; i < users.length; i++){            
                if (data.username === users[i]){
                    room_users.splice(i, 1)
                }
            }
        }
        console.log('room_users: ' + room_users)
    }

});


