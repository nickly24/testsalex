import HomeworkList from "./HomeworkList"
import HomeworkAdd from "./HomeworkAdd"
import React, { useState } from 'react';
function Homework(){
    const [refreshFlag, setRefreshFlag] = useState(false);

  const handleHomeworkAdded = () => {
    setRefreshFlag(prev => !prev); // Инвертируем флаг при добавлении
  };

  return (
    <div className="assignments-panel">
      <HomeworkAdd onHomeworkAdded={handleHomeworkAdded} />
      <HomeworkList refreshFlag={refreshFlag} />
    </div>
  );
}
export default Homework