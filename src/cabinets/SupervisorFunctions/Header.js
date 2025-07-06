import { ReactComponent as Logo } from '../logo.svg';
import StudentsPanel from './StudentsPanel';
import './Supervisor.css';
export default function Header(){
    const handleLogout = () => {
        localStorage.removeItem('role');
        localStorage.removeItem('id');
        localStorage.removeItem('full_name');
        localStorage.removeItem('group_id');
        window.location.reload();
    };
    return(
        <>
         <div className='wrapper mb20'>
            <div className='header'>
                <Logo/>
                <div className='left'>
                    <button onClick={handleLogout} className="logout-button">Выйти</button>
                </div>
            </div>
         </div>
         <div className='wrapper'>
            <StudentsPanel/>
         </div>
        </>
        
    )
};