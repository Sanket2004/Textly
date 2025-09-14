import React, { useEffect, useState, useMemo } from 'react';
import useAppStore from '../stores/useStore';
import { Link } from 'react-router-dom';
import { GoClock, GoPerson, GoPlus, GoLock, GoGlobe } from 'react-icons/go';

export default function RoomList() {
    const { availableRooms, loading, getAvailableRooms } = useAppStore();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        getAvailableRooms();
    }, [getAvailableRooms]);

    // Filter rooms based on search term
    const filteredRooms = useMemo(() => {
        return availableRooms.filter((room) =>
            room.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [availableRooms, searchTerm]);

    if (loading) {
        return (
            <div className='h-[calc(100vh-125px)] flex items-center justify-center'>
                <div className='flex flex-col items-center gap-3'>
                    <div className='w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin' />
                    <p className='text-gray-500 text-sm'>Loading rooms...</p>
                </div>
            </div>
        );
    }

    if (availableRooms.length === 0) {
        return (
            <div className='h-[calc(100vh-125px)] flex items-center justify-center'>
                <div className='flex flex-col items-center gap-6 text-center max-w-sm'>
                    <div className='w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl flex items-center justify-center'>
                        <GoPlus size={32} className='text-blue-500' />
                    </div>
                    <div className='space-y-2'>
                        <h3 className='text-lg font-semibold text-gray-800'>No rooms available</h3>
                        <p className='text-gray-500 text-sm leading-relaxed'>
                            Be the first to create a room and start connecting with others
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='space-y-4'>
            <div>
                <h1 className='text-xl font-medium text-center'>Available Rooms</h1>
                <p className='text-gray-500 text-center'>Join a room to chat with others</p>
            </div>
            {/* Search Bar */}
            <div className='p-2 max-w-md mx-auto mb-8'>
                <input
                    type='text'
                    placeholder='Search rooms'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black'
                />
            </div>

            {/* Room Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-1'>
                {filteredRooms.length === 0 ? (
                    <p className='text-center text-gray-500 col-span-full'>No rooms match your search.</p>
                ) : (
                    filteredRooms.map((room) => (
                        <Link
                            to={`/room/${room._id}`}
                            key={room._id}
                            className='group cursor-pointer bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 overflow-hidden'
                        >
                            {/* Header Section */}
                            <div className='bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 relative overflow-hidden'>
                                <div className='absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16' />
                                <div className='relative z-10 space-y-3'>
                                    <div className='flex items-start justify-between gap-3'>
                                        <h2 className='font-bold text-xl leading-tight line-clamp-2 group-hover:text-blue-200 transition-colors'>
                                            {room.name}
                                        </h2>
                                        <div className={`flex-shrink-0 p-1.5 rounded-lg ${room.isPrivate ? 'bg-amber-500/20' : 'bg-green-500/20'}`}>
                                            {room.isPrivate ? <GoLock size={14} className='text-amber-200' /> : <GoGlobe size={14} className='text-green-200' />}
                                        </div>
                                    </div>
                                    {room.description && (
                                        <p className='text-slate-300 text-sm leading-relaxed line-clamp-2'>
                                            {room.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className='p-6 space-y-4'>
                                <div className='flex items-center justify-between'>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${room.isPrivate ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                                        {room.isPrivate ? <GoLock size={12} /> : <GoGlobe size={12} />}
                                        {room.isPrivate ? 'Private' : 'Public'}
                                    </span>
                                </div>

                                <div className='space-y-3 text-sm'>
                                    <div className='flex items-center gap-3 text-gray-600'>
                                        <div className='w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0'>
                                            <GoClock size={14} className='text-gray-500' />
                                        </div>
                                        <span className='truncate'>
                                            {new Date(room.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>

                                    <div className='flex items-center gap-3 text-gray-600'>
                                        <div className='w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0'>
                                            <GoPerson size={14} className='text-gray-500' />
                                        </div>
                                        <span className='truncate font-medium'>
                                            {room.owner || 'Anonymous'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
