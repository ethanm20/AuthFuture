
export function GenerateBase32SecretKey() {
    var random = require('random-string-generator');
    var randomText = random('alphanumeric')

    

    return randomText
}