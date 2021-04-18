const generateMessage = (options)=>{
    return {
        createdAt: new Date().getTime(),
        ...options
    }
}

module.exports = {
    generateMessage
}