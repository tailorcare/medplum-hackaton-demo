import { HomerSimpson } from '@medplum/mock';
import { ResourceForm, Document, useMedplumNavigate } from '@medplum/react';
import React from 'react';
import { medplum } from '../main';

const NewPatient = () => {
  const navigate = useMedplumNavigate();

  const handleSubmit = async (formData: any) => {
    const patient = await medplum.createResource({
      resourceType: 'Patient',
      ...formData,
    });
    navigate('/');
  };

  return (
    <Document>
      <ResourceForm
        defaultValue={HomerSimpson}
        onSubmit={(formData: any) => {
          handleSubmit(formData);
        }}
      />
    </Document>
  );
};

export default NewPatient;
