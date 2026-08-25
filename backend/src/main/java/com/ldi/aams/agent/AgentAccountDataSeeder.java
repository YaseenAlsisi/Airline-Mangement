package com.ldi.aams.agent;

import com.ldi.aams.agent.internal.balance.AgentImportBatchRepository;
import com.ldi.aams.agent.internal.balance.AgentImportResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.io.InputStream;

@Component
@RequiredArgsConstructor
@Slf4j
public class AgentAccountDataSeeder implements ApplicationRunner {

    private final AgentAccountImportService importService;
    private final AgentImportBatchRepository batchRepository;
    
    @Value("classpath:data/agent-accounts.xlsx")
    private Resource excelResource;

    @Override
    public void run(ApplicationArguments args) {
        if (batchRepository.existsByStatusNot("DELETED")) {
            log.info("Agent account data already seeded, skipping.");
            return;
        }
        
        log.info("Seeding agent account data from Excel workbook...");
        try (InputStream is = excelResource.getInputStream()) {
            AgentImportResult result = importService.importFromStream(
                is, "agent-accounts.xlsx", null
            );
            log.info("Seeded {} agents, {} transactions ({} passengers, {} payments)",
                result.getTotalAgents(), result.getTotalTransactions(),
                result.getTotalPassengers(), result.getTotalPayments());
        } catch (Exception e) {
            log.error("Failed to seed agent account data. It may not exist in classpath yet.", e);
        }
    }
}
