// Traditional Reactive UI Pattern
// The old way: loading spinner → wait → result

function TraditionalUI() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    setLoading(true);
    try {
      const result = await fetchData();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleClick}>Ask Question</button>
      {loading && <Spinner />}
      {data && <Answer>{data}</Answer>}
      {error && <Error>{error.message}</Error>}
    </div>
  );
}
