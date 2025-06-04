import React from 'react';

const HomePage = () => {
    return (
        <div className="flex flex-col items-center justify-center gap-8">
            <h1 className="text-center text-6xl font-martian font-bold bg-gradient-to-tl from-gray-100 to-black text-transparent bg-clip-text">
                Todo Card App
            </h1>
            <p className="text-lg text-gray-600 font-martian tracking-tighter">
                a todo <span className="relative inline-block">
                    <span className="animate-[list-to-card_1s_ease-in-out_infinite]">card</span>
                    <span className="absolute bottom-0 left-0 w-full h-[0.6em] bg-marker opacity-50 -z-10 transform -rotate-2"></span>
                </span> that helps you <span className="relative inline-block">
                    <span className="font-bold">focus</span>
                    <span className="absolute bottom-0 left-0 w-full h-[0.6em] bg-marker opacity-50 -z-10 transform -rotate-2"></span>
                </span> one card at a time
            </p>
            <div className="relative w-64 h-72 group">
                <div className="absolute w-full h-full bg-white shadow-lg rounded-lg transform rotate-6 transition-transform duration-300 group-hover:scale-110"></div>
                <div className="absolute w-full h-full bg-white shadow-lg rounded-lg transition-transform duration-300 group-hover:scale-110"></div>
            </div>
        </div>
    );
};

export default HomePage;