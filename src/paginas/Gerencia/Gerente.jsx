import React from 'react'
import { NavBar } from '../../componentes/NavBarGeneral'
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';

export const Gerente = () => {
  const location = useLocation();
  const usuario = location.state;
  const navigate = useNavigate();

  const ir_rendiciones = () => {
    navigate('/gest-rendi', { state: usuario })
    
  }

  const ir_rep_ventas = () => {
    navigate('/report-vtas', { state: usuario })
    
  }

  const ir_rep_prestamos = () => {
    navigate('/report-prest', { state: usuario })
   
  }

  const ir_gastos = () => {
    navigate('/gest-gastos', { state: usuario })
   
  }




  return (
    <div>
      <NavBar usuario={usuario} />

      <Container className="mt-5 mb-5">
        <Row className="mb-4 text-center">

          <Col md={6}>


            <Card className='border border-info bg-info bg-opacity-10 p-2 m-2 rounded'>

              <Card.Body>
                <h5>Planes o Sistemas de venta</h5>
                <hr />
                <div className="my-3">
                  <i className="bi bi-file-earmark-text" style={{ fontSize: '2rem' }}></i>
                </div>
                <Card.Text>
                  ver el reporte financiero de todos los planes os istemas vendidos
                </Card.Text>

                <Button
                  variant="outline-primary"
                  onClick={ir_rep_ventas}
                >
                  Reporte de planes o sistemas de venta
                </Button>{' '}
              </Card.Body>
            </Card>

          </Col>

          <Col md={6}>


            <Card className='border border-info bg-info bg-opacity-10 p-2 m-2 rounded'>

              <Card.Body>
                <h5>Préstamos</h5>
                <hr />
                <div className="my-3">
                  <i className="bi bi-cash-coin" style={{ fontSize: '2rem' }}></i>
                </div>
                <Card.Text>
                  Ver reporte financiero de los prestamos realizados.
                </Card.Text>

                <Button
                  variant="outline-primary"
                  onClick={ir_rep_prestamos}
                >
                  Reporte de Préstamos
                </Button>{' '}
              </Card.Body>
            </Card>

          </Col>




        </Row>

        <Row>

          <Col md={6}>



            <Card className='border border-info bg-info bg-opacity-10 p-2 m-2 rounded'>

              <Card.Body className="text-center">
                <h5>Gastos</h5>
                <hr />
                <div className="my-3">
                  <i className="bi bi-wallet2" style={{ fontSize: '2rem' }}></i>
                </div>
                <Card.Text>
                  Reporte del total de gastos y todos los gastos registrados.
                </Card.Text>
                <Button
                  variant="outline-primary"
                  onClick={ir_gastos}
                >
                  Reporte de Gastos
                </Button>
              </Card.Body>
            </Card>

          </Col>

          <Col md={6}>


            <Card className='border border-info bg-info bg-opacity-10 p-2 m-2 rounded'>

              <Card.Body className="text-center">
                <h5>Rendiciones</h5>
                <hr />
                <div className="my-3">

                  <i className="bi bi-receipt-cutoff" style={{ fontSize: '2rem' }}></i>
                </div>
                <Card.Text>
                  Reporte de las rendiciones a recibir o recibidas.
                </Card.Text>
                <Button
                  variant="outline-primary"
                  onClick={ir_rendiciones}
                >
                  Rendiciones
                </Button>
              </Card.Body>
            </Card>

          </Col>

        </Row>


      </Container>


    </div>
  )
}
