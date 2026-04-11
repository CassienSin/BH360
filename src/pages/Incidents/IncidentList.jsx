import { useAppSelector } from '../../store/hooks';
import AdminIncidentTable from '../../components/incidents/AdminIncidentTable';
import ResidentIncidentCards from '../../components/incidents/ResidentIncidentCards';
import { isStaffRole, isTanodRole } from '../../config/roles';

const IncidentList = () => {
  const { user } = useAppSelector((state) => state.auth);

  // Staff roles (captain, kagawad, secretary) and tanod see the admin table
  if (isStaffRole(user?.role) || isTanodRole(user?.role)) {
    return <AdminIncidentTable />;
  }

  return <ResidentIncidentCards />;
};

export default IncidentList;

