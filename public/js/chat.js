const socket = io();

//Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $locationSendButton = document.querySelector('#send-location');
const $message = document.querySelector('#messages');

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-url-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options
const { username, room } = Qs.parse(location.search,{ ignoreQueryPrefix: true});

const autoScroll = ()=>{
    // New message element
    const $newMessage = $message.lastElementChild;

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight+newMessageMargin;

    // Visible height
    const visibleHeight = $message.offsetHeight;

    // Height of messages height
    const containerHeight = $message.scrollHeight;

    // How far have i scrolled?
    const scrollOffset = $message.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset){
        $message.scrollTop = $message.scrollHeight
    }
}

socket.on('message',(message)=>{
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt: moment(message.createdAt).format('h:mm:ss a')
    });
    $message.insertAdjacentHTML('beforeend',html);
    autoScroll();
});
socket.on('locationMessage',(message)=>{
    const html = Mustache.render(locationTemplate,{
        username:message.username,
        url:message.text,
        createdAt:moment(message.createdAt).format('h:mm:ss a')
    });
    $message.insertAdjacentHTML('beforeend',html);
    autoScroll();
});
socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html;
})
$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    $messageFormButton.setAttribute('disabled','disabled')
    const message = e.target.elements.message.value;
    socket.emit('sendMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();
        if(error){
            return console.log(error);
        }
        console.log('Message delivered!')
    });
});

$locationSendButton.addEventListener('click',(e)=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser.');
    }
    $locationSendButton.setAttribute('disabled','disabled');
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            longitude:position.coords.longitude,
            latitude:position.coords.latitude
        },()=>{
            console.log('Location Shared!');
            $locationSendButton.removeAttribute('disabled');
        });
    })
});

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error);
        location.href = '/';
    }
})
