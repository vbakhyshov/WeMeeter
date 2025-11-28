import React from 'react'
import pic1 from '../../Pictures/pfp_1.JPG'
import pic2 from '../../Pictures/pfp_2.JPG'
import pic3 from '../../Pictures/pfp_3.JPG'
import pic4 from '../../Pictures/pfp_4.JPG'
import pic5 from '../../Pictures/pfp_5.JPG'
import VerifiedIcon from '@mui/icons-material/Verified';

const testProfile = [
    {
        id: 87,
        username: "vbakhyshov",
        name: "Vahid",
        surname: "Bakhyshov",
        avatar: "https://cdn.pixabay.com/photo/2023/08/20/20/36/irish-setter-8203156_1280.jpg",
        age: "21",
        nationality: "Ukraine",
        location: "Ulm",
        picture1: pic1,
        picture2: pic2,
        picture3: pic3,
        picture4: pic4,
        picture5: pic5,
        bio: "I love playing and watching football. I study computer sciences in THU (Ulm). I usually play table tennis in evening.",
        interestsBio: "Football, Movies, IT, Table Tennis, Computer Games",
        languagesBio: "English, Ukrainian, russian, Azerbaijani, German",
        countriesBio: "Ukraine, Turkey, Germany, Italy, France, Switzerland, russia, Azerbaijan, Georgia, Vatican",
        verified: true,
    },
];

const ProfileUserDetails = () => {
    const user = testProfile[0];

    return (
        <div className="flex w-full min-h-screen bg-gray-100">
            <div className="w-[15%]"></div>

            <div className="w-[70%] py-10">

                {/* Start Block */}
                <div className="flex justify-center gap-20 mb-10">
                    {/* Avatar */}
                    <div className="flex flex-col items-center">
                        <img
                            className="w-48 h-48 rounded-full object-cover border-4 border-[#BA4631]"
                            src={user.avatar}
                            alt="profile"
                        />
                    </div>

                    {/* Info */}
                    <div className="flex flex-col gap-2 text-left pt-4">
                        <h1 className="text-3xl font-bold">
                            {user.name} {user.surname}

                            {user.verified && (
                                <VerifiedIcon
                                    className="text-[#BA4631]"
                                    sx={{ fontSize: 30 }}
                                />
                            )}
                        </h1>
                        <h1 className="font-bold text-xl text-gray-500">
                            @{user.username}
                        </h1>
                        <p className="text-2xl">
                            {user.nationality}, {user.age}
                        </p>

                        {/*BUTTTONS*/}
                        <div className="flex items-center gap-4 h-auto">
                            <button
                                type="button"
                                className="px-8 py-3
                                bg-[#BA4631]
                                text-white font-semibold
                                rounded-full shadow-md
                                hover:bg-red-400
                                transition-colors duration-300"
                            >
                                Edit
                            </button>
                            <button
                                type="button"
                                className="px-8 py-3
                                bg-white
                                text-[#BA4631] font-semibold
                                border-2 border-[#BA4631]
                                rounded-full shadow-sm
                                hover:bg-[#BA4631] hover:text-white
                                transition-colors duration-300"
                            >
                                Friends
                            </button>
                        </div>

                    </div>
                </div>

                {/* Родительский контейнер с ограничением ширины (max-w-3xl) */}
                <div className="flex flex-col items-center max-w-3xl mx-auto gap-6 px-6 w-full pb-20">

                    {/* Разделитель (если нужен) */}
                    <hr className="w-full border-gray-300 my-2" />

                    {/* 1. КОЛЛАЖ */}
                    <div className="w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 text-left">
                        {/* Изменил h-96 на h-[600px] и sm:h-[500px] на sm:h-[800px] */}
                        <div className="grid grid-cols-2 grid-rows-2 gap-4 h-[600px] sm:h-[800px]">
                            <img src={pic1} className="w-full h-full object-cover rounded-2xl" alt="1" />
                            <img src={pic2} className="w-full h-full object-cover rounded-2xl" alt="2" />
                            <img src={pic3} className="w-full h-full object-cover rounded-2xl" alt="3" />
                            <img src={pic4} className="w-full h-full object-cover rounded-2xl" alt="4" />
                        </div>
                    </div>

                    {/* 2. BIO */}
                    <div className="w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 text-left">
                        <h2 className="text-2xl font-bold mb-4 text-black">
                            Bio
                        </h2>
                        <p className="text-lg text-gray-700 leading-relaxed">
                            {user.bio}
                        </p>
                    </div>

                    {/* 3. HOBBIES */}
                    <div className="w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 text-left">
                        <h2 className="text-2xl font-bold mb-4 text-black">
                            Interests
                        </h2>
                        <p className="text-lg text-gray-700 leading-relaxed">
                            {user.interestsBio}
                        </p>
                    </div>

                    {/* 4. LANGUAGES */}
                    <div className="w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 text-left">
                        <h2 className="text-2xl font-bold mb-4 text-black">
                            Languages
                        </h2>
                        <p className="text-lg text-gray-700 leading-relaxed">
                            {user.languagesBio}
                        </p>
                    </div>

                    {/* 5. COUNTRIES */}
                    <div className="w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 text-left">
                        <h2 className="text-2xl font-bold mb-4 text-black">
                            Countries
                        </h2>
                        <p className="text-lg text-gray-700 leading-relaxed">
                            {user.countriesBio}
                        </p>
                    </div>

                </div>
            </div>

            <div className="w-[15%]"></div>
        </div>
    )
}

export default ProfileUserDetails;