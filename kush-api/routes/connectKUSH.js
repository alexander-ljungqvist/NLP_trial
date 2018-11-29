function connectKUSH(urlKUSH){
    const options = {
        har: {
        url: urlKUSH,
        method: 'GET',
        headers: [
            {
            name: 'x-goog-authenticated-user-email',
            value: 'accounts.google.com:rasmus.letterkrantz@softhouse.se'
            }
        ]
        }
    }

    return options;
}

module.exports = {
    connectKUSH
};