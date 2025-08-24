import React, { useState, useEffect } from "react";
import { Button } from "@/components/Button/Button";
import type { EnhancedAnalysis, UserAnswers, Question as QuestionType } from "@/types/openaiQuestion/route";

interface QuestionProps {
  currentQuestion: QuestionType;
  currentQuestionIndex: number;
  totalQuestions: number;
  answers: UserAnswers;
  errors: Record<string, string>;
  analysis?: EnhancedAnalysis | null;
  isLoading: boolean;
  onAnswerQuestion: (questionId: string, answer: string | string[]) => void;
  onNextQuestion: () => void;
  onPreviousQuestion: () => void;
}

export const Question: React.FC<QuestionProps> = ({
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  answers,
  errors,
  analysis,
  isLoading,
  onAnswerQuestion,
  onNextQuestion,
  onPreviousQuestion,
}) => {
  const questionError = errors[currentQuestion.id];
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  
  // Local state for input value
  const [inputValue, setInputValue] = useState("");
  
     // Update input value when question changes or answer changes
   useEffect(() => {
     const answer = answers[currentQuestion.id];
     if (currentQuestion.options && currentQuestion.options.length > 0) {
       // For questions with options, only show additional text (not selected options)
       if (Array.isArray(answer)) {
         const additionalText = answer.filter(item => !currentQuestion.options?.includes(item));
         setInputValue(additionalText.length > 0 ? additionalText[0] : "");
       } else {
         setInputValue("");
       }
     } else {
       // For text-only questions
       setInputValue(typeof answer === 'string' ? answer : Array.isArray(answer) ? answer.join(', ') : "");
     }
   }, [currentQuestion.id, answers[currentQuestion.id], currentQuestion.options]);



  // แสดงข้อมูลการวิเคราะห์เบื้องต้น
  const renderAnalysisSummary = () => {
    if (!analysis) return null;

    return (
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-blue-800 mb-3">สรุปการวิเคราะห์เบื้องต้น:</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-700">ประเภทโปรเจ็ค:</span>
            <p className="text-blue-600">{analysis.projectType}</p>
          </div>
          <div>
            <span className="font-medium text-blue-700">ระดับความซับซ้อน:</span>
            <p className="text-blue-600">{analysis.complexity}</p>
          </div>
          <div>
            <span className="font-medium text-blue-700">กลุ่มเป้าหมาย:</span>
            <p className="text-blue-600">{analysis.targetAudience}</p>
          </div>
          <div>
            <span className="font-medium text-blue-700">ข้อมูลที่ขาดหายไป:</span>
            <p className="text-blue-600">{analysis.missingElements?.length || 0} รายการ</p>
          </div>
          {analysis.designPreferences?.designStyle && (
            <div className="col-span-2">
              <span className="font-medium text-blue-700">สไตล์การออกแบบ:</span>
              <p className="text-blue-600">{analysis.designPreferences.designStyle}</p>
            </div>
          )}
        </div>
        {analysis.missingElements && analysis.missingElements.length > 0 && (
          <div className="mt-3">
            <span className="font-medium text-blue-700">ข้อมูลที่ขาดหายไป:</span>
            <ul className="list-disc list-inside mt-1">
              {analysis.missingElements.map((element, index) => (
                <li key={index} className="text-blue-600 text-sm">{element}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  if (!currentQuestion) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800">ไม่พบคำถาม</h3>
          <p className="text-yellow-700">กรุณาลองใหม่อีกครั้ง</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">คำถามเพิ่มเติม</h2>
      <p className="text-gray-600">
        กรุณาตอบคำถามเพื่อให้เราเข้าใจความต้องการของคุณมากขึ้น
      </p>

      {renderAnalysisSummary()}

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="mb-4">
          <span className="text-sm text-gray-500">
            คำถามที่ {currentQuestionIndex + 1} จาก {totalQuestions}
          </span>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-4">
          {/* แสดงข้อมูลที่ขาดหายไปถ้าเป็นคำถามที่สร้างจาก missingElements */}
          {currentQuestion.category === 'missing_info' && analysis && (
            <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg mb-3">
              <p className="text-orange-700 text-sm">
                <span className="font-medium">ข้อมูลที่ต้องการ:</span> {currentQuestion.question.replace('กรุณาระบุรายละเอียดเกี่ยวกับ: ', '')}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              {currentQuestion.question}
              {currentQuestion.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </h3>
            {currentQuestion.priority && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                currentQuestion.priority === 'high' 
                  ? 'bg-red-100 text-red-700' 
                  : currentQuestion.priority === 'medium'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {currentQuestion.priority === 'high' ? 'สำคัญ' : 
                 currentQuestion.priority === 'medium' ? 'ปานกลาง' : 'ต่ำ'}
              </span>
            )}
          </div>

          {questionError && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
              <p className="text-red-700 text-sm">{questionError}</p>
            </div>
          )}

                     {currentQuestion.options && currentQuestion.options.length > 0 ? (
             <div className="space-y-4">
               {/* Options checkboxes */}
               <div className="space-y-2">
                 {currentQuestion.options.map((option) => (
                   <label key={option} className="flex items-center space-x-2">
                     <input
                       type="checkbox"
                       name={currentQuestion.id}
                       value={option}
                       onChange={(e) => {
                         // Handle checkbox for all questions with options
                         const currentAnswers = answers[currentQuestion.id];
                         const currentArray = Array.isArray(currentAnswers) ? currentAnswers : [];
                         
                         if (e.target.checked) {
                           onAnswerQuestion(currentQuestion.id, [...currentArray, option]);
                         } else {
                           onAnswerQuestion(currentQuestion.id, currentArray.filter(item => item !== option));
                         }
                       }}
                       checked={
                         Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].includes(option)
                       }
                       className="text-blue-600"
                     />
                     <span>{option}</span>
                   </label>
                 ))}
               </div>
               
                               {/* Additional text input */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เพิ่มคำตอบอื่นๆ (ถ้ามี):
                  </label>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setInputValue(newValue);
                      
                      // Get currently selected options
                      const currentAnswers = answers[currentQuestion.id];
                      const selectedOptions = Array.isArray(currentAnswers) 
                        ? currentAnswers.filter(item => currentQuestion.options?.includes(item))
                        : [];
                      
                      // Combine selected options with new text input
                      const combinedAnswers = [...selectedOptions];
                      if (newValue.trim()) {
                        combinedAnswers.push(newValue.trim());
                      }
                      
                      onAnswerQuestion(currentQuestion.id, combinedAnswers);
                    }}
                    placeholder="พิมพ์คำตอบเพิ่มเติม..."
                    className={`w-full p-3 border rounded-lg ${
                      questionError ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                </div>
             </div>
           ) : (
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                const newValue = e.target.value;
                setInputValue(newValue);
                onAnswerQuestion(currentQuestion.id, newValue);
              }}
              placeholder="พิมพ์คำตอบของคุณ..."
              className={`w-full p-3 border rounded-lg ${
                questionError ? "border-red-300" : "border-gray-300"
              }`}
            />
          )}

          <div className="flex space-x-2">
            {currentQuestionIndex > 0 && (
              <Button
                onClick={onPreviousQuestion}
                variant="outline"
                disabled={isLoading}
              >
                ก่อนหน้า
              </Button>
            )}

                         <Button
               onClick={onNextQuestion}
               disabled={
                 (currentQuestion.options && currentQuestion.options.length > 0 
                   ? (!Array.isArray(answers[currentQuestion.id]) || answers[currentQuestion.id].length === 0)
                   : !answers[currentQuestion.id]) || isLoading
               }
               className="flex-1"
             >
              {currentQuestionIndex < totalQuestions - 1
                ? "ถัดไป"
                : "ประเมินคุณภาพ"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
