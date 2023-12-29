import { useParams } from 'react-router-dom';
import { Condition } from '@medplum/fhirtypes';
import { Col, Flex, Grid, Image, Modal, Paper, Text } from '@mantine/core';
import { Document } from '@medplum/react';
import { useHover } from '@mantine/hooks';

type ConditionWithCarePlan = Condition & { isOnCarePlan: boolean };

const Conditions = ({ conditions }: { conditions: ConditionWithCarePlan[] }) => {
  const { id } = useParams();

  if (!conditions || conditions.length === 0) {
    return (
      <Document>
        <Flex justify="center">
          <Text size={24} weight={500} title="Conditions Not Yet in Careplan">
            Conditions Not Yet in Careplan
          </Text>
        </Flex>
        <p>No conditions</p>
      </Document>
    );
  }

  return (
    <Document>
      <Modal onClose={() => console.log('open')} opened={false} size="calc(100vw - 3rem)" />
      <Flex justify="center">
        <Text size={24} weight={500} title="Conditions Not Yet in Careplan">
          Conditions Not Yet in Careplan
        </Text>
      </Flex>

      {conditions?.map((condition) => (
        <ConditionCard condition={condition} key={condition.id} />
      ))}
    </Document>
  );
};

const ConditionCard = ({ condition }: { condition: ConditionWithCarePlan }) => {
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
            src="https://images.unsplash.com/photo-1543333995-a78aea2eee50?q=80&w=3000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="img"
            fit="cover"
            width={100}
            height={100}
          />
        </Col>
        <Col span={8}>
          <Flex direction="column">
            <Text weight={700}>Condition ID: {condition.id}</Text>
            {condition.bodySite?.map((bodySite, index) => (
              <Flex key={index} direction="column">
                <Text weight={500} title="Related Body Site">
                  {' '}
                  {bodySite.coding?.map((code) => code.display)}{' '}
                </Text>
              </Flex>
            ))}
          </Flex>
        </Col>
      </Grid>
    </Paper>
  );
};

export default Conditions;
