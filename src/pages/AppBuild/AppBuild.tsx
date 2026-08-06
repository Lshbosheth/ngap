import EditLayout from '../../layout/EditLayout';
import {useLocation} from "react-router-dom";
export default function AppBuild() {
    const mockMode = new URLSearchParams(window.location.hash.split('?')[1] || '').get('mock');
    return (
        <div style={{ height: '100%' }}>
            <EditLayout path={mockMode === 'guided' ? 'applicationOrchestration' : useLocation().state?.path}/>
        </div>
    );
}
