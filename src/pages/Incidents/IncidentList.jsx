import { useAppSelector } from '../../store/hooks';
import AdminIncidentTable from '../../components/incidents/AdminIncidentTable';
import ResidentIncidentCards from '../../components/incidents/ResidentIncidentCards';

const IncidentList = () => {
  const { user } = useAppSelector((state) => state.auth);

  // Render different views based on user role
  if (user?.role === 'admin' || user?.role === 'tanod') {
    return <AdminIncidentTable />;
  }

  return <ResidentIncidentCards />;
};

export default IncidentList;

