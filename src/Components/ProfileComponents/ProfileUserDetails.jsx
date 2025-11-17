import React from 'react'

const testProfile = [
    {
        id: 87,
        username: "vbakhyshov",
        name: "Vahid",
        surname: "Bakhyshov",
        avatar: "https://cdn.pixabay.com/photo/2023/08/20/20/36/irish-setter-8203156_1280.jpg",
        birthday: "30.04.2004",
        nationality: "Ukraine",
        location: "Ulm"
    },
];

const ProfileUserDetails = () => {
    const user = testProfile[0];

    return (

        <div className="py-20 px-20 flex flex-col items-center">
            <div>
                <img
                    className="w-32 h-32 rounded-full items-center"
                    src={user.avatar}
                    alt="profile"
                />
            </div>
            <div>
                <h1 className="text-center h-10">@{user.username}</h1>
            </div>
            <h1 className="">
                {user.name} {user.surname}
            </h1>
            <p>
                <strong>Birthday:</strong> {user.birthday}
            </p>
            <p>
                <strong>Nationality:</strong> {user.nationality}
            </p>
            <p>
                <strong>Location:</strong> {user.location}
            </p>
        </div>
    )
}

export default ProfileUserDetails;