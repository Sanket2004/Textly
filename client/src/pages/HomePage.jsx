import React, { useEffect } from 'react'
import useAppStore from '../stores/useStore'
import RoomList from "../components/RoomList"

export default function HomePage() {

    return (
        <section className='p-6'>
            <RoomList />
        </section>
    )
}
