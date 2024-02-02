import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="container-home">
      <h1>Quizzical</h1>

      <Link to="/quiz" className="btn btn-link">
        Start quiz
      </Link>
    </div>
  );
};

export default Home;
