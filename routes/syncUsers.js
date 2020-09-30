const axios = require('axios')
const userTransform = require('../utils/userUtils')
const syncUsers = (userRepository) => {
    return async (req, res) => {
        let promises = []
        try {

            axios.get('https://api.github.com/search/users?q=payflow').then(
                externalServerRequest => {
                    if (externalServerRequest.status === 200) {
                        const users = externalServerRequest.data.items.filter(user => user.type === userRepository.TYPE_USER);
                        const oldUsers = new Set(userRepository.findAllUsers().map(user => user.login))
                        users.forEach(
                            user => {
                                promises.push(axios(user.url))
                            }
                        )
                        Promise.all(promises).then(
                            detailedUsersRequests => {
                                detailedUsersRequests.forEach(
                                    detailedUserRequest => {

                                        const userInfo = detailedUserRequest.data
                                        userRepository.deleteUserByUserName(userInfo.login)
                                        userRepository.addUser(userTransform(userInfo))
                                        oldUsers.delete(userInfo.login)


                                    }
                                )
                                oldUsers.forEach(oldUser => userRepository.deleteUserByUserName(oldUser))
                                res.sendStatus(200)
                            }
                        )

                    }
                }
            )
        }
        catch (error){
            res.sendStatus(500)
        }

    }
}

module.exports = syncUsers;