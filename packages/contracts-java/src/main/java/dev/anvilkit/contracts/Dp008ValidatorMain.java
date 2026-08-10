package dev.anvilkit.contracts;

import com.networknt.schema.InputFormat;
import com.networknt.schema.SchemaRegistry;
import com.networknt.schema.SpecificationVersion;
import tools.jackson.databind.json.JsonMapper;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** DP-008 process adapter for NetworkNT 3.0.6. */
public final class Dp008ValidatorMain {
    private static String argument(String[] args, String name) { for(int index=0;index+1<args.length;index++)if(args[index].equals(name))return args[index+1];throw new IllegalArgumentException("missing "+name); }
    public static void main(String[] args) throws Exception {
        String operation=argument(args,"--operation");if(!operation.equals("validate"))System.exit(2);int iterations=Integer.parseInt(argument(args,"--iterations"));if(iterations<1)System.exit(4);
        String schemaSource=Files.readString(Path.of(argument(args,"--schema")));byte[] input=Files.readAllBytes(Path.of(argument(args,"--input")));
        var schema=SchemaRegistry.withDefaultDialect(SpecificationVersion.DRAFT_2020_12).getSchema(schemaSource, InputFormat.JSON);
        var admission=new ContractValidator(Path.of("../..").toAbsolutePath().normalize());String parseOutcome="accepted";boolean valid=false;List<Map<String,String>> findings=new ArrayList<>();
        for(int index=0;index<iterations;index++){try{var value=admission.admit(input);var errors=schema.validate(value);valid=errors.isEmpty();findings=new ArrayList<>();for(var error:errors)findings.add(Map.of("code","VALIDATION_FAILED","instancePath",error.getInstanceLocation().toString(),"schemaPath",error.getSchemaLocation().toString()));}catch(Exception error){parseOutcome="rejected";valid=false;findings=List.of(Map.of("code","PARSE_REJECTED","instancePath","/","schemaPath","/profile/strictAdmission"));}}
        Map<String,Object> result=new LinkedHashMap<>();result.put("candidateId","java-json-schema-validator");result.put("candidateVersion","3.0.6");result.put("operation",operation);result.put("iterations",iterations);result.put("parseOutcome",parseOutcome);result.put("valid",valid);result.put("orderedFindings",findings);System.out.println(JsonMapper.builder().build().writeValueAsString(result));
    }
}
