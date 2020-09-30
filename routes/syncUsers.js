const axios = require('axios')
const userTransform = require('../utils/userUtils')
const syncUsers = (userRepository) => {
    return async (req, res) => {
        let promises = []
        axios.get('https://api.github.com/search/users?q=payflow').then(
            externalServerRequest => {
                if (externalServerRequest.status === 200) {
                    const users = externalServerRequest.data.items.filter(user => user.type === userRepository.TYPE_USER);
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


                                }
                            )
                            res.sendStatus(200)
                        }
                        )

                } else {
                    res.sendStatus(500)
                }

                // Como no sé que tan variable son los cambios en la base de datos, lo más rapido es eliminar toda la base de
                // datos anterior y obtener una nueva. Caso contrario habria que iterar por la base de datos local, contraponiendolo
                // con los usuarios de la base de datos externa, eliminando los que no estan y al final agregando los que estan.
                // Tampoco tengo conocimiento que tantas veces esto se hace, ni que tipo de base de datos es.
                // userRepository.findAllUsers().forEach(
                //     user =>{
                //       if (userRepository.findByUserName(user.login) !== undefined){
                //         userRepository.addUser(user)
                //       }
                //       else{
                //
                //       }
                //     }
                //
                // )
            }
        )

    }
}

module.exports = syncUsers;