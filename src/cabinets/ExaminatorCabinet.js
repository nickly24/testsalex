import Exam from "./ExaminatorFunctions/Exam";
import Examiner from "./ExaminatorFunctions/Examiner";

function ExaminatorCabinet() {
    const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('id');
    localStorage.removeItem('full_name');
    localStorage.removeItem('group_id');
    window.location.reload();
  };
    return(
        <>
            <button onClick={handleLogout} className="logout-button">
                Выйти
              </button>
              <Examiner/>
        </>
        
    )
}
export default ExaminatorCabinet;