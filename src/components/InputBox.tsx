const InputBox = (props: {
  type: string;
  placeholder: String;
  setValue: any;
  autocap: string;
}) => {
  return (
    <>
      <div className="p-2.5">
        <input
          type={props.type}
          autoCapitalize={props.autocap}
          placeholder={`${props.placeholder}`}
          className="bg-gray-900 rounded-md text-white h-10"
          onChange={(e) => props.setValue(e.target.value)}
        />
      </div>
    </>
  );
};
export default InputBox;
