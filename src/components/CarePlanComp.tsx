import { Box, Button, Col, Flex, Grid, Image, Modal, Paper, Text } from '@mantine/core';
import { Document, SearchControl } from '@medplum/react';
import { medplum } from '../main';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { CarePlan, Condition } from '@medplum/fhirtypes';
import { useHover } from '@mantine/hooks';
import { userInfo } from 'os';

type CarePlanWithConditionName = {
  id: string;
  name?: string;
  ref?: string;
};

const CarePlanComp = () => {
  const { id } = useParams();
  const navigator = useNavigate();

  const [carePlanModal, setCarePlanModal] = useState(false);
  const [carePlanInfo, setcarePlanInfo] = useState<CarePlan>();
  const [carePlans, setCarePlans] = useState<CarePlan[]>();
  const [patientName, setPatientName] = useState('');
  const [conditionsWithCPId, setConditionsWithCPId] = useState<CarePlanWithConditionName[]>([]);
  const [currentConditionsName, setCurrentConditionsName] = useState<CarePlanWithConditionName[]>([]);

  useEffect(() => {
    const getInformation = async () => {
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
          },
          addresses {
            reference,
          },
        }
        
      }
    }`;
      const response = await medplum.graphql(query);
      const carePlans = response.data.Patient.CarePlanList;

      const carePlanWithRefs = carePlans
        .map((carePlan: CarePlan) => {
          return carePlan.addresses?.map((ref) => {
            return { id: carePlan.id, ref: ref.reference };
          });
        })
        .flat();

      const CarePlanWithCondition = await Promise.all(
        carePlanWithRefs.map(async (element: any) => {
          if (!element.ref) return { ...element, name: 'undefined' };
          const condition = await medplum.readResource('Condition', element.ref.split('/')[1]);
          const bodySites = condition.bodySite
            ?.map((bodypart) => {
              return bodypart.coding?.map((coding) => coding.code);
            })
            .flat()
            .join('\n');
          return { ...element, name: bodySites };
        })
      );
      setConditionsWithCPId(CarePlanWithCondition);
      setCarePlans(response.data.Patient.CarePlanList);
      setPatientName(response.data.Patient.name[0].family);
    };

    getInformation();
  }, []);

  const displayModal = (carePlan: CarePlan) => {
    const conditions = conditionsWithCPId.filter((allCarePlans) => allCarePlans.id === carePlan.id);
    setcarePlanInfo(carePlan);
    setCarePlanModal(true);
    setCurrentConditionsName(conditions);
  };

  const removeCarePlan = async (carePlanId?: string) => {
    if (!carePlanId) return;
    const deleted = await medplum.deleteResource('CarePlan', carePlanId);
    navigator(`/Patient/${id}/careplan`);
  };
  const CarePlanCard = ({ carePlan }: { carePlan: CarePlan }) => {
    const { hovered, ref } = useHover();
    const conditionsOfCarePlan = conditionsWithCPId.filter((element) => element.id === carePlan.id);

    return (
      <Paper
        ref={ref}
        p="md"
        shadow="xs"
        style={{ marginBottom: '20px', cursor: 'pointer', background: hovered ? '#f2f2f2' : '#ffff' }}
      >
        <Grid gutter="md" style={{ alignItems: 'center' }}>
          <Col span={4} onClick={() => displayModal(carePlan)}>
            <Image
              src="https://plus.unsplash.com/premium_photo-1661765503688-c895c93cf8c0?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="img"
              fit="cover"
              width={100}
              height={100}
            />
          </Col>
          <Col span={4} onClick={() => displayModal(carePlan)}>
            <Flex direction="column">
              <Text weight={700}>
                Title: {carePlan.title} - {patientName}
              </Text>
              {conditionsOfCarePlan.map((address, index) => (
                <Text key={index}>{address.name}</Text>
              ))}
            </Flex>
          </Col>
          <Col span={4}>
            <Button
              variant="outline"
              color="red"
              onClick={() => {
                removeCarePlan(carePlan.id);
              }}
            >
              Delete
            </Button>
          </Col>
        </Grid>
      </Paper>
    );
  };

  return (
    <>
      <Modal onClose={() => setCarePlanModal(false)} opened={carePlanModal} size="calc(100vw - 3rem)">
        <Grid grow gutter="lg" pb={25}>
          <Grid.Col span={4}>
            <Text size={34}>Condition that addressess</Text>
            {currentConditionsName.map((cond, index) => (
              <Box p={16} key={index}>
                <Text size="lg">{cond.name}</Text>
              </Box>
            ))}
          </Grid.Col>
          <Grid.Col span={4}>
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
