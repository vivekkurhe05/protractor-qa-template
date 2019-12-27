# How should one choose test cases for regression?

Choosing test cases for regression packs is not a trivial exercise. There are three types of test suites executed during each release of a software application: regression tests, release specific tests, and defect fix verification tests. Careful thought and attention must accompany the selection of test sets for the regression pack.

The following are some of the guidelines to accomplish this selection exercise:

* **Include the test cases that have frequently yielded buy:** Some areas in the application are so error-prone that they usually fail following a small coding change. We can keep track of these failing test cases throughout the product cycle and cover them in the regression test suite.

* **Include the test cases that verify the core features of the application:** Prior to designing the test cases, identify all the core features of the application. Ensure that test cases cover all the functionalities mentioned in the requirements document. One can make use of a traceability matrix to ensure that no requirement is left untested.

* **Include the test cases for functionalities that have undergone recent changes:** Maintain the history of functionality changes for test case documentation in order to identify the test cases to include in the regression suite.

* **Include all the integration test cases:** Even if integration testing is a separate part of the software testing cycle, its test cases should be included in the regression test suite. As a last-minute fix, an already-tested application can break the integrity between two different modules. For example, data might get lost across an interface, messages might not get passed properly, or interfaces might not be implemented as specified.

* **Include all the complex test cases:** Some system functionalities may only be accomplished by following a complex sequence of Graphic User Interface (GUI) events. To open a file, a user may have to click on the File menu and then select Open, use a dialog box to specify the filename, and then focus the application on the newly opened window. Obviously, increasing the number of possible operations exponentially augments the sequencing problem. This can become a serious issue; in some scenarios, the whole system's functionality comes to a halt. Hence, all the complex test cases should
be part of the regression test suite.

* **Prioritize the test cases for regression testing:** Prioritize the test cases as they relate to business impact and critical and frequently used functionalities. It is always helpful if an analysis is completed to determine which test cases are relevant. One idea is to classify the test cases into various priorities based on importance and customer use. Here, it is suggested that test cases be sorted into three categories:

    * **Priority 0:**  Sanity test cases check for basic functionality (as per the SRS of the application) and are run to verify presystem acceptance and ensure functionality after an application under test goes through a major change. These test cases deliver high project value.

    * **Priority 1:** This includes the test cases that test the essential functionalities for delivering high project value.

    * **Priority 2:** These are executed as a part of the system test cycle and are selected for regression testing as needed. These test cases deliver moderate project value.

The selection of test cases based on priority will greatly reduce the efforts spent on regression testing. The following points explain the test cases in detail:

* **Categorize the selected test cases:** Regression testing becomes very difficult when the application scope is large and there are continuous increments or patches to the system. In such cases, selective tests need to be executed in order to save on both testing costs and time. Categorizing test cases makes this work easier. We can place them into two main categories:

    * **Reusable test cases:** These include test cases that can be repetitively used in succeeding regression cycles. This can be automated so that a set of test cases can be easily executed on a new build.

    * **Obsolete test cases:** These are bug-specific and cannot be used in succeeding cycles. The smart way to use them is when the respective bugs occur.

* **Choose the test cases on a case-to-case basis:** There can be several correct approaches to regression testing that must be decided on a case-to-case basis:

    * If the criticality and impact of the bug fixes are low, then it is enough that a test engineer selects a few test cases from the test management tool and executes them. These test cases can fall under any Priority (0, 1, or 2).

    * If the criticality and impact of the bug fixes are medium, then the tester needs to execute all the Priority 0 and Priority 1 test cases. If bug fixes need additional test cases from Priority 2, then those test cases can also be selected and used for regression testing. Selecting Priority 2 test cases in this instance is desirable, but not obligatory.

    * If the criticality and impact of the bug fixes is high, then we need to execute all Priority 0, Priority 1, and carefully-selected Priority 2 test cases. One can also go through the complete log of changes that occur as a result of bug fixes and select the test cases to conduct regression testing. This is an elaborate process, but it can give very good results.

* **Classify regression test cases based on the risk exposure:** The classification of the regression test cases must be performed at the beginning of the project and verified at the closure. Test cases are categorized based on their risk exposure and are calculated based on the scientific logic given here:

Risk Exposure (RE= R x P) = Requirements Risk (R) x Probability for Defect (P)

Probability for Defect (P) = Number of Defects (N) x Average Severity of the Defects (S)
