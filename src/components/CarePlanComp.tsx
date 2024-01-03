import { Col, Flex, Grid, Image, Modal, Paper, Text } from '@mantine/core';
import { Document, SearchControl } from '@medplum/react';
import { medplum } from '../main';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { CarePlan } from '@medplum/fhirtypes';
import { useHover } from '@mantine/hooks';
import { userInfo } from 'os';

const CarePlanComp = () => {
  const { id } = useParams();
  const [carePlanModal, setCarePlanModal] = useState(false);
  const [carePlanInfo, setcarePlanInfo] = useState<CarePlan>();
  const [carePlans, setCarePlans] = useState<CarePlan[]>();
  const [patientName, setPatientName] = useState('');

  useEffect(() => {
    const query = `{
      Patient(id: "${id}") {
        name {
          family,
          
        },
        CarePlanList(_reference: patient, _count: 100, _sort: "-_lastUpdated") {
          id,
          meta { lastUpdated },
          title,
          subject {
            reference
          },
          careTeam {
            reference
          },
          note {
            text
          }
          addresses {
            reference,
          }
        }
      }
    }`;
    medplum
      .graphql(query)
      .then((response) => {
        const carePlans = response.data.Patient.CarePlanList;
        setCarePlans(carePlans);

        setPatientName(response.data.Patient.name[0].family);
      })
      .catch(console.error);
  }, []);

  const displayModal = (carePlan: CarePlan) => {
    setcarePlanInfo(carePlan);
    setCarePlanModal(true);
    console.log(carePlan);
  };

  const CarePlanCard = ({ carePlan }: { carePlan: CarePlan }) => {
    const { hovered, ref } = useHover();

    return (
      <Paper
        ref={ref}
        p="md"
        shadow="xs"
        style={{ marginBottom: '20px', cursor: 'pointer', background: hovered ? '#f2f2f2' : '#ffff' }}
        onClick={() => displayModal(carePlan)}
      >
        <Grid gutter="md" style={{ alignItems: 'center' }}>
          <Col span={4}>
            <Image
              src="https://plus.unsplash.com/premium_photo-1661765503688-c895c93cf8c0?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="img"
              fit="cover"
              width={100}
              height={100}
            />
          </Col>
          <Col span={8}>
            <Flex direction="column">
              <Text weight={700}>
                Title: {carePlan.title} - {patientName}
              </Text>
              {carePlan.addresses?.map((address, index) => (
                <Text key={index}>{address.reference}</Text>
              ))}
            </Flex>
          </Col>
        </Grid>
      </Paper>
    );
  };

  return (
    <>
      <Modal onClose={() => setCarePlanModal(false)} opened={carePlanModal} size="calc(100vw - 3rem)">
        <Grid grow gutter="lg">
          <Grid.Col span={4}>
            <Text size={34}>Condition that addressess</Text>
            {carePlanInfo?.addresses?.map((cond, index) => (
              <Text key={index}>{cond.reference}</Text>
            ))}
          </Grid.Col>
          <Grid.Col span={8}>
            <Text size={34}>Care Plan Info</Text>
            <Flex direction="column" gap={10}>
              {/* Title */}
              <Text size={16} weight="bolder">
                Title
              </Text>
              <Text size={16}>{carePlanInfo?.title}</Text>
              {/* Patient */}
              <Text size={16} weight="bolder">
                Patient
              </Text>
              <Text>{carePlanInfo?.subject?.reference}</Text>
              {/* Care Team */}
              <Text size={16} weight="bolder">
                Care Team
              </Text>
            </Flex>
          </Grid.Col>
        </Grid>
      </Modal>
      <Document>
        <Flex justify="center">
          <Text size={24} weight={500} title="Care Plans">
            Care Plans
          </Text>
        </Flex>
        {carePlans?.map((carePlan) => (
          <CarePlanCard carePlan={carePlan} key={carePlan.id} />
        ))}
      </Document>
    </>
  );
};

export default CarePlanComp;
