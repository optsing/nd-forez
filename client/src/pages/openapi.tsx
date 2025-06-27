import { API_URL } from "../consts";


const OpenAPIPage: React.FC = () => {
    return (
        <iframe src={`${API_URL}/api/docs`} style={{ width: '100%', height: '100vh', border: 0 }} />
    )
};

export default OpenAPIPage;
