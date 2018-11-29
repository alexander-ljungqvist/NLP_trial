function connectKUSH(urlKUSH){
    const options = {
        har: {
        url: urlKUSH,
        method: 'GET',
        headers: [
            {
            name: '',
            value: ''
            }
        ]
        }
    }

    return options;
}

module.exports = {
    connectKUSH
};