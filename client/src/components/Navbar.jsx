import React, { useState } from 'react'
import useAppStore from '../stores/useStore'
import { GoPerson, GoPlus, GoSignOut } from "react-icons/go";
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import CreateRoomModal from './CreateRoomModal';


export default function Navbar() {
  const { username } = useAppStore();
  const [open, setOpen] = useState(false);


  const logout = () => {
    try {
      useAppStore.persist.clearStorage();
      useAppStore.setState({ username: null });
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };


  return (
    <>
      <nav className='p-6 bg-white/70 backdrop-blur-lg flex items-center justify-between sticky top-0 z-50'>
        <Link to={'/'}>
          <h1 className="text-xl font-black">Textly</h1>
        </Link>
        <ul className='flex gap-6'>
          <li className='cursor-pointer' onClick={() => setOpen(true)}>
            <GoPlus size={20} />
          </li>
          <li className='cursor-pointer'>
            <GoPerson size={20} onClick={() => {
              toast(
                <div className='flex items-center gap-3'>
                  <GoPerson className='w-10 h-10 bg-black text-white p-2 rounded-full' />
                  <div className='flex flex-col items-start'>
                    <h2 className='font-medium text-sm'>Profile</h2>
                    <p className='text-sm'>Logged in as <span className='text-black'>@{username}</span></p>
                  </div>
                </div>
              );
            }} />
          </li>
          <li className='cursor-pointer' onClick={logout}>
            <GoSignOut size={20} />
          </li>
        </ul>
      </nav>
      <CreateRoomModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  )
}
