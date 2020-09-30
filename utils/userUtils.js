
function transformOutsideUserInformation(user){
    return {userName: user.login,externalId: user.id.toString(),picture: user.avatar_url,externalSource:"github",email:user.email? user.email: "none@none.cl"}

}

module.exports = transformOutsideUserInformation