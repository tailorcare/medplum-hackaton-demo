import { Col, Flex, Grid, Image, Paper, Text } from '@mantine/core';
import { Document, SearchControl } from '@medplum/react';
import { medplum } from '../main';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { CarePlan } from '@medplum/fhirtypes';
import { useHover } from '@mantine/hooks';

const CarePlanComp = () => {
  const { id } = useParams();

  const [carePlans, setCarePlans] = useState<CarePlan[]>();

  useEffect(() => {
    const query = `{
      Patient(id: "${id}") {
        CarePlanList(_reference: patient, _count: 100, _sort: "-_lastUpdated") {
          id,
          meta { lastUpdated },
          title,
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
        console.log('🚀 ~ file: CarePlanComp.tsx:28 ~ .then ~ response:', response);
        const carePlans = response.data.Patient.CarePlanList;
        setCarePlans(carePlans);
      })
      .catch(console.error);
  }, []);

  return (
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
  );
};

const CarePlanCard = ({ carePlan }: { carePlan: CarePlan }) => {
  const { hovered, ref } = useHover();

  return (
    <Paper
      ref={ref}
      p="md"
      shadow="xs"
      style={{ marginBottom: '20px', cursor: 'pointer', background: hovered ? '#f2f2f2' : '#ffff' }}
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
            <Text weight={700}>Title: {carePlan.title}</Text>
            {carePlan.note &&
              carePlan.note.map((note, index) => {
                return (
                  note.text && (
                    <Text key={index} weight={700}>
                      Note: {note.text}
                    </Text>
                  )
                );
              })}
          </Flex>
        </Col>
      </Grid>
    </Paper>
  );
};

export default CarePlanComp;
