package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.SlotConfigRequest;
import com.healthcare.labtestbooking.entity.SlotConfig;
import com.healthcare.labtestbooking.repository.SlotConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SlotConfigService {

    private final SlotConfigRepository slotConfigRepository;

    @Transactional
    public SlotConfig saveSlotConfig(SlotConfig config) {
        log.info("Saving slot config for day: {}", config.getDayOfWeek());
        return slotConfigRepository.save(config);
    }

    public Optional<SlotConfig> getConfigByDay(String dayOfWeek) {
        return slotConfigRepository.findByDayOfWeek(dayOfWeek);
    }

    public List<SlotConfig> getAllConfigs() {
        return slotConfigRepository.findAll();
    }

    @Transactional
    public SlotConfig createConfig(SlotConfigRequest request) {
        log.info("Creating slot config for day: {}", request.getDayOfWeek());
        SlotConfig config = new SlotConfig();
        config.setDayOfWeek(request.getDayOfWeek());
        config.setSlotStart(LocalTime.parse(request.getStartTime()));
        config.setSlotEnd(LocalTime.parse(request.getEndTime()));
        config.setCapacity(request.getMaxConcurrentSlots());
        config.setIsActive(true);
        return slotConfigRepository.save(config);
    }

    @Transactional
    public SlotConfig updateConfig(Long id, SlotConfigRequest request) {
        log.info("Updating slot config with id: {}", id);
        SlotConfig config = slotConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Slot configuration not found"));
        config.setDayOfWeek(request.getDayOfWeek());
        config.setSlotStart(LocalTime.parse(request.getStartTime()));
        config.setSlotEnd(LocalTime.parse(request.getEndTime()));
        config.setCapacity(request.getMaxConcurrentSlots());
        return slotConfigRepository.save(config);
    }
}
