import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { Condition, PlanDefinition } from '@medplum/fhirtypes';
import {
  Badge,
  Box,
  Button,
  Card,
  Col,
  Flex,
  Grid,
  Group,
  Image,
  Modal,
  MultiSelect,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import { Document, Form, FormSection } from '@medplum/react';
import { useHover } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { medplum } from '../main';

type ConditionWithCarePlan = Condition & { isOnCarePlan: boolean };

const Conditions = ({ conditions }: { conditions: ConditionWithCarePlan[] }) => {
  const { id: userId } = useParams();
  const navigator = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [newConditionModal, setnewConditionModal] = useState(false);
  const [selectedConditionId, setSelectedConditionId] = useState<string>('');
  const [planDefinitions, setPlanDefinitions] = useState<PlanDefinition[]>([]);

  const modalTrigger = (conditionId: string) => {
    setSelectedConditionId(conditionId);
    setModalOpen(true);
  };

  const newCondiionModalTrigger = (condition: any) => {
    setnewConditionModal(true);
  };

  const PossibleCarePlanCard = ({
    id,
    title,
    userId,
    name,
    conditionId,
  }: {
    id?: string;
    title?: string;
    userId?: string;
    name?: string;
    conditionId?: string;
  }) => {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section>
          <Image
            src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png"
            height={160}
            alt="Norway"
          />
        </Card.Section>

        <Group mt="md" mb="xs">
          <Text fw={500}>{title}</Text>
        </Group>

        <Text size="sm" c="dimmed">
          {name}
        </Text>

        <Button
          color="blue"
          fullWidth
          mt="md"
          radius="md"
          onClick={() => selectPlanHandler(id, title, conditionId, userId)}
        >
          Select this Care Plan
        </Button>
      </Card>
    );
  };

  const ConditionCard = ({
    condition,
    modalTrigger,
  }: {
    condition: ConditionWithCarePlan;
    modalTrigger: (condition: any) => void;
  }) => {
    const { hovered, ref } = useHover();

    return (
      <Paper
        ref={ref}
        p="md"
        shadow="xs"
        style={{ marginBottom: '20px', cursor: 'pointer', background: hovered ? '#f2f2f2' : '#ffff' }}
        //   @ts-ignore
        onClick={() => modalTrigger(condition.id)}
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

  useEffect(() => {
    // Grab all the plan definitions
    const query = `{
        PlanDefinitionList {
            id,
            name,
            title,
        }
      }`;
    medplum.graphql(query).then((res) => {
      setPlanDefinitions(res.data.PlanDefinitionList as PlanDefinition[]);
    });
  }, []);

  const newConditionHandler = async (record: Record<string, string>) => {
    let bodyParts = record.bodypart.split(',');
    const res = await medplum.createResource({
      resourceType: 'Condition',
      subject: { reference: `Patient/${userId}` },
      bodySite: bodyParts.map((bodypart) => {
        return { coding: [{ code: bodypart, display: bodypart }] };
      }),
    });
    navigator(`/Patient/${userId}/careplan`);
  };

  return (
    <Document>
      {/* CREATE NEW CONDITION */}
      <Modal onClose={() => setnewConditionModal(false)} opened={newConditionModal} size="calc(100vw - 3rem)">
        <Paper h="50vh">
          <Form onSubmit={newConditionHandler}>
            <Stack>
              <FormSection title="Body Part">
                <MultiSelect name="bodypart" data={['left knee', 'right arm', 'back neck']} />
              </FormSection>
            </Stack>
            <Button mt={24} type="submit">
              Submit
            </Button>
          </Form>
        </Paper>
      </Modal>

      {/* SELECT PLAN FOR CONDITION */}
      <Modal onClose={() => setModalOpen(false)} opened={modalOpen} size="calc(100vw - 3rem)">
        <Paper>
          <Text>Add condition to the care plan</Text>
          <SimpleGrid cols={2} p={16}>
            {planDefinitions.map((plan) => (
              <PossibleCarePlanCard
                key={plan.id}
                id={plan.id}
                title={plan.title}
                name={plan.name}
                userId={userId}
                conditionId={selectedConditionId}
              />
            ))}
          </SimpleGrid>
        </Paper>
      </Modal>

      <Flex justify="center">
        <Text size={24} weight={500} title="Conditions Not Yet in Careplan">
          Conditions Not Yet in Careplan
        </Text>
      </Flex>

      {!conditions || (conditions.length === 0 && <p>No Conditions</p>)}
      {conditions?.map((condition) => (
        <ConditionCard condition={condition} key={condition.id} modalTrigger={modalTrigger} />
      ))}
      <Paper
        p="md"
        shadow="xs"
        style={{ marginBottom: '20px', cursor: 'pointer' }}
        //   @ts-ignore
        onClick={() => newCondiionModalTrigger()}
      >
        <Grid gutter="md" style={{ alignItems: 'center', cursor: 'pointer' }}>
          <Col span={4}>+</Col>
          <Col span={8}>
            <Flex direction="column">
              <Text weight={700}>Create New Condition</Text>
            </Flex>
          </Col>
        </Grid>
      </Paper>
    </Document>
  );
};

const selectPlanHandler = async (id?: string, title?: string, conditionId?: string, userId?: string) => {
  if (!userId) return;
  const res = await medplum.createResource({
    resourceType: 'CarePlan',
    instantiatesCanonical: [`DefinitionPlan/${id}`],
    title: `${userId} - ${title}`,
    status: 'active',
    intent: 'plan',
    subject: { reference: `Patient/${userId}` },
    addresses: [{ reference: `Condition/${conditionId}` }],
  });
};

export default Conditions;
