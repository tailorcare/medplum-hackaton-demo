import { useResource } from '@medplum/react';
import { Fragment } from 'react';
import Conditions from '../components/Conditions';
import CarePlanComp from '../components/CarePlanComp';
import { useParams } from 'react-router-dom';
import { Patient } from '@medplum/fhirtypes';
import { Flex, Grid, Loader, Modal } from '@mantine/core';
import { getReferenceString } from '@medplum/core';
import { Document, SearchControl } from '@medplum/react';
import { useEffect, useState } from 'react';
import { medplum } from '../main';
import { CarePlan, Condition, Reference } from '@medplum/fhirtypes';

type ConditionWithCarePlan = Condition & { isOnCarePlan: boolean };

const CarePlanPage = () => {
  const { id } = useParams();
  const patient = useResource<Patient>({ reference: `Patient/${id}` });
  const [patientCarePlans, setPatientCarePlans] = useState<CarePlan[]>([]);

  if (!patient) {
    return <Loader />;
  }

  const [conditions, setConditions] = useState<ConditionWithCarePlan[]>();
  useEffect(() => {
    const query = `{
      Patient(id: "${id}") {
        ConditionList(_reference: patient, _count: 100, _sort: "-_lastUpdated") {
          id,
          meta { lastUpdated },
          bodySite {
            id,
            text,
            coding {
              id,
              code,
              display
            }
          }
        }
        CarePlanList(_reference: patient, _count: 100, _sort: "-_lastUpdated") {
          id,
          title,
          addresses {
            reference
          }
        }
      }
    }`;

    medplum
      .graphql(query)
      .then((response) => {
        const conditionList = response.data.Patient.ConditionList;
        const carePlanList = response.data.Patient.CarePlanList;

        const conditionsWithCarePlan = conditionList.map((condition: Condition) => {
          const isOnCarePlan = carePlanList.some((carePlan: CarePlan) =>
            carePlan.addresses?.some(
              (address: Reference<Condition>) => address.reference === `Condition/${condition.id}`
            )
          );
          return { ...condition, isOnCarePlan };
        });

        setPatientCarePlans(carePlanList);
        setConditions(conditionsWithCarePlan);
      })
      .catch(console.error);
  }, []);

  return (
    <>
      <Fragment key={getReferenceString(patient)}>
        <Grid gutter="xs" justify="start" columns={12}>
          <Grid.Col span={6}>
            <Conditions
              conditions={conditions?.filter((condition) => !condition.isOnCarePlan) || []}
              carePlanList={patientCarePlans}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <CarePlanComp />
          </Grid.Col>
        </Grid>
      </Fragment>
    </>
  );
};

export default CarePlanPage;
