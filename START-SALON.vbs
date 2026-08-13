<<<<<<< HEAD
' AI Salon Pro — WINDOWS ONE-CLICK START
' Double-click this file to start the salon.
Set sh = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
root = fso.GetParentFolderName(WScript.ScriptFullName)
ps1 = root & "\START-SALON.ps1"
bat = root & "\START-SALON.bat"
If fso.FileExists(ps1) Then
  sh.Run "powershell -NoProfile -ExecutionPolicy Bypass -File """ & ps1 & """", 1, False
ElseIf fso.FileExists(bat) Then
  sh.Run """" & bat & """", 1, False
Else
  MsgBox "START-SALON.ps1 / START-SALON.bat not found in:" & vbCrLf & root, 16, "AI Salon Pro"
End If
=======
' AI Salon Pro — WINDOWS ONE-CLICK START
' Double-click this file to start the salon.
Set sh = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
root = fso.GetParentFolderName(WScript.ScriptFullName)
ps1 = root & "\START-SALON.ps1"
bat = root & "\START-SALON.bat"
If fso.FileExists(ps1) Then
  sh.Run "powershell -NoProfile -ExecutionPolicy Bypass -File """ & ps1 & """", 1, False
ElseIf fso.FileExists(bat) Then
  sh.Run """" & bat & """", 1, False
Else
  MsgBox "START-SALON.ps1 / START-SALON.bat not found in:" & vbCrLf & root, 16, "AI Salon Pro"
End If
>>>>>>> 2f23706cd8508a6fbfd27a35d77282f4ba763b6c
