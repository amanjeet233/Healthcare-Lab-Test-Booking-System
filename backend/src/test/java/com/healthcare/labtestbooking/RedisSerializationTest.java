package com.healthcare.labtestbooking;

import com.healthcare.labtestbooking.dto.LabTestDTO;
import com.healthcare.labtestbooking.dto.TestParameterDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.RedisTemplate;
import java.math.BigDecimal;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
public class RedisSerializationTest {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Test
    public void testLabTestDTOSerialization() {
        TestParameterDTO param = TestParameterDTO.builder()
                .id(1L)
                .parameterName("Test Param")
                .unit("mg/dL")
                .build();

        LabTestDTO dto = LabTestDTO.builder()
                .id(1L)
                .testName("Test Lab")
                .price(BigDecimal.valueOf(100.00))
                .parameters(List.of(param))
                .build();

        redisTemplate.opsForValue().set("test_serialization_key_1", dto);

        LabTestDTO fetchedDto = (LabTestDTO) redisTemplate.opsForValue().get("test_serialization_key_1");
        assertNotNull(fetchedDto);
    }
}
