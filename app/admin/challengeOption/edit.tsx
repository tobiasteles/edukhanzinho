import {
  BooleanInput,
  Edit,
  ReferenceInput,
  required,
  SimpleForm,
  TextInput,
} from "react-admin";

export const ChallengeOptionEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="text" validate={[required()]} label="Texto" />
        <BooleanInput
        source="correct"
        label="Opção Correta"
        />
        <ReferenceInput source="challengeId" reference="challenges" label="Questão"/>
       <TextInput
       source="imageSrc"
       validate={[required()]}
       label="Image"
       />
       <TextInput
       source="audioSrc"
       validate={[required()]}
       label="Audio"
       />
      </SimpleForm>
    </Edit>
  );
};
