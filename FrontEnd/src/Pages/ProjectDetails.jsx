import { useParams } from "react-router-dom";

const ProjectDetails = () => {
  const { projectId } = useParams();

  return (
    <>
      <div className='project-box'>
        <div className="dashboard-box">

        </div>
      </div>
    </>
  );
};

export default ProjectDetails;