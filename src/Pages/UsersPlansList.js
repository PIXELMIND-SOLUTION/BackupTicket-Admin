import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Table,
  Pagination,
  PaginationItem,
  PaginationLink,
  Spinner,
} from 'reactstrap';

const UsersPlansList = () => {
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  useEffect(() => {
    const fetchUserPlans = async () => {
      try {
        const response = await axios.get('http://31.97.206.144:4061/api/admin/usersplans');
        if (response.data && response.data.users) {
          setUsersData(response.data.users);
        }
      } catch (err) {
        setError('Error fetching users with subscribed plans.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserPlans();
  }, []);

  if (loading)
    return (
      <div className="text-center my-5">
        <Spinner color="primary" />
        <p>Loading users...</p>
      </div>
    );

  if (error) return <p className="text-danger">{error}</p>;

  // Pagination Logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = usersData.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(usersData.length / usersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Container fluid className="mt-4">
      <Row className="justify-content-center">
        <Col lg="10">
          <Card className="shadow-sm">
            <CardHeader style={{ backgroundColor: '#5B21B6', color: '#fff' }} className="py-2 px-3">
              <h5 className="mb-0">Users with Subscribed Plans</h5>
            </CardHeader>
            <CardBody className="p-3">
              {currentUsers.length === 0 ? (
                <p>No users with subscribed plans found.</p>
              ) : (
                <>
                  <Table size="sm" bordered responsive className="mb-2">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Mobile</th>
                        <th>Subscribed Plans</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.map((user, index) => (
                        <tr key={user.email}>
                          <td>{indexOfFirstUser + index + 1}</td>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>{user.mobile}</td>
                          <td>
                            {user.subscribedPlans?.length > 0 ? (
                              <ul className="mb-0 ps-3 small">
                                {user.subscribedPlans.map((plan, i) => (
                                  <li key={i}>
                                    <strong>{plan.name}</strong> <br />
                                    ₹{plan.offerPrice} ({plan.discountPercentage}% off) <br />
                                    {plan.duration} • {new Date(plan.startDate).toLocaleDateString()} ➜{' '}
                                    {new Date(plan.endDate).toLocaleDateString()}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-muted">No subscribed plans</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {/* Pagination Right-Aligned */}
                  <div className="d-flex justify-content-end">
                    <Pagination size="sm">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <PaginationItem key={i} active={i + 1 === currentPage}>
                          <PaginationLink onClick={() => handlePageChange(i + 1)}>
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                    </Pagination>
                  </div>
                </>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UsersPlansList;
